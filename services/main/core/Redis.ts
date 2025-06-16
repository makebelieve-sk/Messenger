import { REDIS_CHANNEL, TimeoutType } from "common-types";
import { RedisStore } from "connect-redis";
import { createClient, RedisClientType } from "redis";

import redisConfig from "@config/redis.config";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { RedisError } from "@errors/index";
import { RedisKeys } from "@custom-types/enums";
import { HEARTBEAT_TIMEOUT_MS, REDIS_TIMEOUT_RECONNECTION, REDIS_TTL } from "@utils/constants";

const logger = Logger("Redis");
const CHANNELS = [ REDIS_CHANNEL.HEARTBEAT, REDIS_CHANNEL.CRITICAL_ERRORS ];

// Класс, отвечает за работу с клиентом Redis. Также, содержит внутри себя сущность хранилища RedisStore
export default class RedisWorks {
	private _client!: RedisClientType;
	private _subscriber!: RedisClientType;
	private _redisStore!: RedisStore;
	private _lastHeartbeat: number = Date.now();
	private _timeoutReconnect!: TimeoutType;
	private _heartbeatMonitor!: TimeoutType;

	constructor() {
		this._connectRedis();
	}

	get redisClient() {
		return this._client;
	}

	get redisStore() {
		return this._redisStore;
	}

	private _connectRedis() {
		logger.debug("init");

		this._client = createClient(redisConfig.client);
		this._client.connect().catch(async (error: Error) => await this._connectErrorHandler(t("redis.error.client_connect") + error.message));

		this._redisStore = new RedisStore(redisConfig.store(this._client));

		this._bindListeners();

		this._createSubscriber();
	}

	private _bindListeners() {
		this.redisClient.on("connect", this._connectHandler);
		this.redisClient.on("ready", this._readyHandler);
		this.redisClient.on("error", async (error: Error) => await this._connectErrorHandler(t("redis.error.client_work") + error.message));
		this.redisClient.on("end", this._endHandler);
	}

	async publish(channel: REDIS_CHANNEL, data: Object) {
		const message = JSON.stringify(data);
		const receivers = await this._client.publish(channel, message);

		logger.debug(t("redis.message_published", { message, channel, receivers: receivers.toString() }));
	}

	private _createSubscriber() {
		logger.info(t("redis.subsciber_create"));

		this._subscriber = this.redisClient.duplicate();

		this._subscriber
			.connect()
			.then(() => {
				logger.info(t("redis.subscriber_connect_successfull"));

				this._subscribeToChannels();
				this._startHeartbeatMonitor();
			})
			.catch(async (error: Error) => await this._connectErrorHandler(t("redis.error.subscriber_connect", { error: error.message }) ));
	}

	private _subscribeToChannels() {
		for (const channel of CHANNELS) {
			this._subscriber.subscribe(channel, message => {
				switch (channel) {
				case REDIS_CHANNEL.HEARTBEAT: {
					logger.debug(t("redis.subscriber_ping_successful"));

					this._lastHeartbeat = Date.now();

					break;
				}
				case REDIS_CHANNEL.CRITICAL_ERRORS: {
					const parsedData = JSON.parse(message);

					logger.error(t("redis.subscriber_critical_error", {
						type: parsedData.type,
						error: parsedData.error,
						timestamp: parsedData.timestamp,
						pid: parsedData.pid,
					}));

					break;
				}
				default:
					logger.error(t("redis.error.subscriber_unknown_channel", { channel }));
				}
			});
		}
	}

	private async _unsubscribeFromChannels() {
		await Promise.all(
			CHANNELS.map(async channel => await this._subscriber.unsubscribe(channel)),
		);
	}

	private _startHeartbeatMonitor() {
		this._heartbeatMonitor = setInterval(() => {
			const delta = Date.now() - this._lastHeartbeat;
			if (delta > HEARTBEAT_TIMEOUT_MS) {
				logger.warn(t("redis.error.no_heartbeat", {
					seconds: (delta / 1000).toFixed(0),
					treshold: HEARTBEAT_TIMEOUT_MS.toString(),
				}));
			}
		}, HEARTBEAT_TIMEOUT_MS);
	}

	private _stopHeartbeatMonitor() {
		if (this._heartbeatMonitor) {
			clearInterval(this._heartbeatMonitor);
		}
	}

	private _connectHandler() {
		logger.info(t("redis.connection_successfull"));
	}

	private _readyHandler() {
		logger.info(t("redis.start_to_work"));
	}

	private async _connectErrorHandler(errorText: string) {
		this._errorHandler(errorText);
		await this.close();

		if (this._timeoutReconnect) {
			clearTimeout(this._timeoutReconnect);
		}

		this._stopHeartbeatMonitor();

		this._timeoutReconnect = setTimeout(() => {
			logger.info(t("redis.reconnection"));
			this._connectRedis();
		}, REDIS_TIMEOUT_RECONNECTION);
	}

	private _errorHandler(errorText: string) {
		new RedisError(errorText);
	}

	private _endHandler() {
		logger.info(t("redis.stopped"));
	}

	async close() {
		logger.debug("close");

		await this._unsubscribeFromChannels();
		await this._client.disconnect();
		await this._subscriber.disconnect();
	}

	// Получить полный ключ сохраненного значения
	getKey(key: RedisKeys, id: string) {
		return `${key}:${id}`;
	}

	// Обновление времени жизни записи по ключу
	async expire(redisKey: RedisKeys, id: string, ttl: number = REDIS_TTL) {
		const key = this.getKey(redisKey, id);

		await this._client
			.expire(key, ttl)
			.then(() => logger.info(t("redis.ttl_update", { ttl: ttl.toString(), key })))
			.catch((error: Error) => {
				this._errorHandler(t("redis.error.ttl_update", { key, message: error.message }));
			});
	}

	// Получение значения по ключу
	async get(redisKey: RedisKeys, id: string): Promise<string | number | boolean | null | void> {
		logger.debug("get [redisKey=%s, id=%s]", redisKey, id);

		const key = this.getKey(redisKey, id);

		return await this._client
			.get(key)
			.then(result => (result ? JSON.parse(result) : null))
			.catch((error: Error) => {
				this._errorHandler(`${t("redis.error.get_value", { key })}: ${error.message}`);
			});
	}

	// Запись значения по ключу
	async set(redisKey: RedisKeys, id: string, value: string) {
		logger.debug("set [redisKey=%s, id=%s]", redisKey, id);

		const key = this.getKey(redisKey, id);

		await this._client
			.set(key, value)
			.then(() => logger.info(t("redis.new_pair_is_set", { key, value })))
			.catch((error: Error) => {
				this._errorHandler(`${t("redis.error.setting_new_pair", { key, value })}: ${error.message}`);
			});
	}

	// Удаление значения по ключу
	async delete(redisKey: RedisKeys, id: string) {
		logger.debug("delete [redisKey=%s, id=%s]", redisKey, id);

		const key = this.getKey(redisKey, id);

		await this._client
			.del(key)
			.then(() => logger.info(t("redis.key_successfull_deleted", { key })))
			.catch((error: Error) => {
				this._errorHandler(`${t("redis.error.deleted_key", { key })}: ${error.message}`);
			});
	}
}
