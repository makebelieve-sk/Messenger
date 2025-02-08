import { createClient, RedisClientType } from "redis";
import { RedisStore } from "connect-redis";

import { RedisKeys } from "@custom-types/enums";
import { TimeoutType } from "@custom-types/index";
import { RedisError } from "@errors/index";
import { t } from "@service/i18n";
import Logger from "@service/logger";

const logger = Logger("Redis");

const REDIS_CONNECTION_URL = process.env.REDIS_CONNECTION_URL as string;
const REDIS_PREFIX = process.env.REDIS_PREFIX as string;
const REDIS_TTL = parseInt(process.env.REDIS_TTL as string);
const REDIS_TIMEOUT_RECONNECTION = parseInt(process.env.REDIS_TIMEOUT_RECONNECTION as string);

// Класс, отвечает за работу с клиентом Redis. Также, содержит внутри себя сущность хранилища RedisStore
export default class RedisWorks {
    private _client!: RedisClientType;
    private _redisStore!: RedisStore;
    private _timeoutReconnect!: TimeoutType;

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

        this._client = createClient({
            url: REDIS_CONNECTION_URL,   // URL-адрес для подключения к Redis серверу
        });
        this._client
            .connect()
            .catch(async (error: Error) => await this._errorHandler(t("redis.error.client_connect") + error.message, true));

        this._redisStore = new RedisStore({ 
            client: this._client,   // Клиент Redis
            prefix: REDIS_PREFIX,   // Префикс ключа по умолчанию
            ttl: REDIS_TTL          // Устанавливаем начальное время жизни записи в хранилище
        });

        this._bindListeners();
    }

    private _bindListeners() {
        this.redisClient.on("connect", this._connectHandler);
        this.redisClient.on("ready", this._readyHandler);
        this.redisClient.on("error", async (error: Error) => await this._errorHandler(t("redis.error.client_work") + error.message, true));
        this.redisClient.on("end", this._endHandler);
    }

    private _connectHandler() {
        logger.info(t("redis.connection_successfull"));
    }

    private _readyHandler() {
        logger.info(t("redis.start_to_work"));
    }

    private async _errorHandler(errorText: string, close: boolean = false) {
        new RedisError(errorText);

        if (close) await this.close();
    }

    private _endHandler() {
        logger.info(t("redis.stopped"));

        if (this._timeoutReconnect) {
            clearTimeout(this._timeoutReconnect);
        }

        this._timeoutReconnect = setTimeout(() => {
            logger.info(t("redis.reconnection"));
            this._connectRedis();
        }, REDIS_TIMEOUT_RECONNECTION);
    }

    async close() {
        logger.debug("close");
        await this._client.disconnect();
    }

    // Получить полный ключ сохраненного значения
    getKey(key: RedisKeys, id: string) {
        return `${key}:${id}`;
    };

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
            .then(result => result ? JSON.parse(result) : null)
            .catch((error: Error) => {
                this._errorHandler(`${t("redis.error.get_value", { key })}: ${error.message}`);
            });
    };

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
    };

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
    };
};