import { I18nService } from "nestjs-i18n";
import { ErrorQueueDto, NotificationQueueDto } from "src/dto/rabbitmq.dto";
import FileLogger from "src/services/logger.service";
import {
	INJECTION_KEYS,
	NOTIFICATION_TYPE,
	RABBITMQ_QUEUE,
	STRATEGY_ACTION,
} from "src/types/enums";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

// Сервис, содержит методы управления взаимодействием с RabbitMQ
@Injectable()
export default class RabbitMQService implements OnModuleInit {
	constructor(
		@Inject(INJECTION_KEYS.RABBITMQ_NOTIFICATION_SERVER)
		private readonly clientNotification: ClientProxy,
		@Inject(INJECTION_KEYS.RABBITMQ_ERROR_NOTIFICATION_SERVER)
		private readonly clientErrorNotification: ClientProxy,
		@Inject(INJECTION_KEYS.RABBITMQ_ERROR_SERVER)
		private readonly clientError: ClientProxy,
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(RabbitMQService.name);
	}

	// Хук жизненного цикла, который вызывается после инициализации модуля
	async onModuleInit() {
		// Ждём готовности подключений клиентов к rabbitmq
		await this.clientNotification.connect();
		await this.clientErrorNotification.connect();
		await this.clientError.connect();

		// TODO для теста, удалить
		setTimeout(() => {
			this.sendNotificationMessage(RABBITMQ_QUEUE.NOTIFICATION_QUEUE, {
				type: NOTIFICATION_TYPE.SMS,
				recipient: "06FA94E1-1194-4FD7-A6B8-01A8C24EBF05",
				payload: "1488",
				action: STRATEGY_ACTION.PINCODE,
			});
		}, 1000);
	}

	sendNotificationMessage(pattern: string, data: NotificationQueueDto) {
		this.logger.debug(
			this.i18n.t("rabbitmq.send_notification", {
				args: { pattern, data: JSON.stringify(data) },
			}),
		);

		// Событие без ожидания ответа
		this.clientNotification.emit(pattern, data);
	}

	sendErrorNotificationMessage(pattern: string, data: NotificationQueueDto) {
		this.logger.debug(
			this.i18n.t("rabbitmq.send_error_notification", {
				args: { pattern, data: JSON.stringify(data) },
			}),
		);

		// Событие без ожидания ответа
		this.clientErrorNotification.emit(pattern, data);
	}

	sendErrorMessage(pattern: string, data: ErrorQueueDto) {
		this.logger.debug(
			this.i18n.t("rabbitmq.send_error", {
				args: { pattern, data: JSON.stringify(data) },
			}),
		);

		// Событие без ожидания ответа
		this.clientError.emit(pattern, data);
	}

	// Закрываем всех активных клиентов RabbitMQ
	async close() {
		await this.clientNotification.close();
		await this.clientErrorNotification.close();
		await this.clientError.close();

		this.logger.debug(this.i18n.t("rabbitmq.close"));
	}
}
