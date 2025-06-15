import { I18nService } from "nestjs-i18n";
import { firstValueFrom } from "rxjs";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import { PincodeDto } from "src/dto/redis.dto";
import FileLogger from "src/services/logger.service";
import { INJECTION_KEYS, REDIS_CHANNEL } from "src/types/enums";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Cron } from "@nestjs/schedule";

@Injectable()
export default class RedisService implements OnModuleInit {
	constructor(
		@Inject(INJECTION_KEYS.REDIS_SERVER)
		private readonly redis: ClientProxy,
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(RedisService.name);
	}

	// Устанавливаем соединение после инициализации модуля Redis
	async onModuleInit() {
		await this.redis.connect();
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

	// Отправка сообщения в канал (паттерн fire and forget)
	publish(channel: REDIS_CHANNEL, data: NotificationQueueDto) {
		this.logger.debug(
			this.i18n.t("redis.publish", {
				args: { data: JSON.stringify(data), channel },
			}),
		);
		this.redis.emit(channel, JSON.stringify(data));
	}

	// Отправка сообщения в канал и возврат ack при успешной обработке
	publishWithAck(channel: REDIS_CHANNEL, data: PincodeDto): Promise<boolean> {
		this.logger.debug(
			this.i18n.t("redis.publish_with_ack", {
				args: { data: JSON.stringify(data), channel },
			}),
		);
		const ackObservable = this.redis.send<boolean, PincodeDto>(channel, data);

		return firstValueFrom(ackObservable);
	}

	// Закрываем вручную все соединения Redis
	async close() {
		await this.redis.close();

		this.logger.debug(this.i18n.t("redis.close.success"));
	}
}
