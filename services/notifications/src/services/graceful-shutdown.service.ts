import { I18nService } from "nestjs-i18n";
import DatabaseService from "src/services/database.service";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import RedisService from "src/services/redis.service";
import { RABBITMQ_QUEUE, RabbitMQ_SEND_TYPE } from "src/types/enums";
import { Injectable, OnApplicationShutdown } from "@nestjs/common";

// Сервис для обработки хуков жизненного цикла при закрытии/остановке Nest.js приложения.
@Injectable()
export default class GracefulShutdownService implements OnApplicationShutdown {
	constructor(
		private readonly logger: FileLogger,
		private readonly rabbitMQService: RabbitMQService,
		private readonly redis: RedisService,
		private readonly databaseService: DatabaseService,
		private readonly i18n: I18nService,
	) {
		// Устанавливаем логгеру корректный контекст
		this.logger.setContext(GracefulShutdownService.name);
	}

	/**
	 * Где signal — строковый идентификатор сигнала, например "SIGTERM", "SIGINT", "beforeExit" и т.д.
	 * Данный хук вызывается в принципе у любого провайдера сервиса, который зарегистрирован (в поле providers).
	 * Текущий хук является просто глобальным.
	 */
	async onApplicationShutdown(signal?: string) {
		this.logger.warn(
			this.i18n.t("global.graceful_shutdown.signal_received", {
				args: { signal },
			}),
		);

		// Отправляем сообщение об ошибке в очередь ошибок
		this.rabbitMQService.sendErrorMessage(RABBITMQ_QUEUE.ERROR_QUEUE, {
			type: RabbitMQ_SEND_TYPE.APP_ERROR,
			reason: signal,
			at: `${this.i18n.t("global.graceful_shutdown.error_message.at")}: ${new Date().toISOString()}`,
		});

		// Закрываем все соединения
		await this.rabbitMQService.close();
		await this.redis.close();
		await this.databaseService.close();

		this.logger.close();
	}
}
