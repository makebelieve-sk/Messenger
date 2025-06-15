import { Redis } from "ioredis";
import { I18nService } from "nestjs-i18n";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import { PincodeDto } from "src/dto/redis.dto";
import FileLogger from "src/services/logger.service";
import NotificationService from "src/services/notification.service";
import PincodesService from "src/services/tables/pincodes.service";
import { INJECTION_KEYS, REDIS_CHANNEL } from "src/types/enums";
import { fiveMinutes } from "src/utils/constants";
import { Controller, Inject } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

// Контроллер по подписке на канал сообщений Redis
@Controller()
export default class RedisController {
	constructor(
		@Inject(INJECTION_KEYS.IOREDIS_OPTIONS)
		private readonly redis: Redis,
		private readonly logger: FileLogger,
		private readonly notifier: NotificationService,
		private readonly pincodesService: PincodesService,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(RedisController.name);
	}

	// Принимаем сообщения при генерации пинкода
	@MessagePattern(REDIS_CHANNEL.PINCODE_SET)
	async handlePincodeSet(@Payload() data: PincodeDto): Promise<boolean> {
		try {
			this.logger.debug(
				this.i18n.t("redis.handling_message", {
					args: { data: JSON.stringify(data) },
				}),
			);

			const { userId, pincode } = data;
			const key = `user:${userId}:pin`;

			// SADD вернёт 1, если элемент добавлен, 0 — если уже был
			const added = await this.redis.sadd(key, pincode);

			if (added === 1) {
				// выставим TTL, чтобы через, 5 минут пинкод удалился автоматически
				await this.redis.expire(key, fiveMinutes);
				return true; // ACK
			} else {
				return false; // NACK -> будет автогенерация нового пинкода
			}
		} catch (error) {
			this.logger.error(
				this.i18n.t("redis.failed_pincode_handle", {
					args: { data: JSON.stringify(data), error },
				}),
			);

			return false;
		}
	}

	// Принимаем сообщения при удалении пинкода (после его успешной проверки)
	@MessagePattern(REDIS_CHANNEL.PINCODE_DELETE)
	async handlePincodeDelete(@Payload() data: PincodeDto): Promise<boolean> {
		try {
			this.logger.debug(
				this.i18n.t("redis.handling_message", {
					args: { data: JSON.stringify(data) },
				}),
			);

			const { userId, pincode } = data;
			const key = `user:${userId}:pin`;

			// SREM вернёт число удалённых элементов (1 — если элемент был, 0 — если не было)
			const removed = await this.redis.srem(key, pincode);

			if (removed === 1) {
				this.logger.debug(
					this.i18n.t("redis.pincode_deleted", { args: { userId, pincode } }),
				);

				// Удаляем провереный пинкод из базы данных
				await this.pincodesService.removeBy({ pincode });
				return true; // ACK — пинкод удалён
			} else {
				this.logger.warn(
					this.i18n.t("redis.pincode_not_found", { args: { userId, pincode } }),
				);
				return false; // NACK — такого пинкода не было во множестве
			}
		} catch (error) {
			this.logger.error(
				this.i18n.t("redis.failed_pincode_delete", {
					args: { data: JSON.stringify(data), error },
				}),
			);

			return false;
		}
	}

	// Принимаем сообщения о неудачной задаче нотификации
	@MessagePattern(REDIS_CHANNEL.FAILED_NOTIFICATIONS)
	async handleFailedNotifications(@Payload() data: NotificationQueueDto) {
		try {
			this.logger.debug(
				this.i18n.t("redis.handling_message", {
					args: { data: JSON.stringify(data) },
				}),
			);

			const { type, recipient, payload, action } = data;

			// Выполняем входящую задачу на нотификацию
			await this.notifier.notify(type, recipient, payload, action);
		} catch (error) {
			this.logger.error(
				this.i18n.t("redis.failed_proceed_message", {
					args: { data: JSON.stringify(data), error },
				}),
			);
		}
	}
}
