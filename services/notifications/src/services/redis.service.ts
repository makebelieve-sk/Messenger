import Redis, { RedisOptions } from "ioredis";
import { I18nService } from "nestjs-i18n";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import FileLogger from "src/services/logger.service";
import { INJECTION_KEYS, REDIS_CHANNEL } from "src/types/enums";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Cron } from "@nestjs/schedule";

@Injectable()
export default class RedisService implements OnModuleInit {
	private subscriberClient: Redis;

	constructor(
		@Inject(INJECTION_KEYS.REDIS_SERVER)
		private readonly redis: ClientProxy,
		@Inject(INJECTION_KEYS.REDIS_OPTIONS)
		private readonly redisOptions: RedisOptions,
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(RedisService.name);
	}

	// Устанавливаем соединение после инициализации модуля Redis
	async onModuleInit() {
		await this.redis.connect();
	}

	// Создание нового экзампляра Redis для прослушивания канала сообщений
	async createSubscriber(channel: REDIS_CHANNEL): Promise<Redis> {
		// возвращает новый экземпляр Redis только для подписки
		this.subscriberClient = new Redis(this.redisOptions);

		await this.subscriberClient.subscribe(channel, (err, count) => {
			if (err) {
				this.logger.error(
					this.i18n.t("redis.subscribe.error", {
						args: { channel, error: err.message },
					}),
				);
			} else {
				this.logger.debug(
					this.i18n.t("redis.subscribe.success", {
						args: { channel, count },
					}),
				);
			}
		});

		return this.subscriberClient;
	}

	// Каждую 30-ю секунду выполняем публикацию сообщения, тем самым сигнализируя основному серверу о работоспособности
	@Cron("*/30 * * * * *")
	async sendHeartbeat() {
		const payload = { timestamp: Date.now(), status: "OK" };
		this.redis.emit(REDIS_CHANNEL.HEARTBEAT, JSON.stringify(payload));
		this.logger.debug(
			this.i18n.t("redis.heartbeat", {
				args: { payload: JSON.stringify(payload) },
			}),
		);
	}

	// Отправка сообщения в канал
	async publish(channel: REDIS_CHANNEL, data: NotificationQueueDto) {
		this.redis.emit(channel, JSON.stringify(data));
		this.logger.debug(
			this.i18n.t("redis.publish", {
				args: { data: JSON.stringify(data), channel },
			}),
		);
	}

	// Закрываем вручную все соединения Redis
	async close() {
		await this.redis.close();

		if (this.subscriberClient) {
			await this.subscriberClient.unsubscribe(REDIS_CHANNEL.FAILED_NOTIFICATIONS);
			await this.subscriberClient.quit();

			this.logger.debug(
				this.i18n.t("redis.close.unsubscribe", {
					args: { channel: REDIS_CHANNEL.FAILED_NOTIFICATIONS },
				}),
			);
		}

		this.logger.debug(this.i18n.t("redis.close.success"));
	}
}
