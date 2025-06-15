import { I18nService } from "nestjs-i18n";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import RabbitMQExceptionFilter from "src/filters/rabbitmq.filter";
import RabbitLoggingInterceptor from "src/interceptors/rabbitmq.interceptor";
import RabbitMQNotificationValidationPipe from "src/pipes/rabbitmq-notification.pipe";
import FileLogger from "src/services/logger.service";
import NotificationService from "src/services/notification.service";
import { RABBITMQ_QUEUE } from "src/types/enums";
import { Controller, UseFilters, UseInterceptors } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { ApiExcludeController } from "@nestjs/swagger";

// Контроллер, управляет сервисом RabbitMQ
@ApiExcludeController()
@Controller()
@UseInterceptors(RabbitLoggingInterceptor)
@UseFilters(RabbitMQExceptionFilter)
export default class RabbitMQController {
	constructor(
		private readonly notifier: NotificationService,
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(RabbitMQController.name);
	}

	// Обработка сообщений из очереди NOTIFICATION_QUEUE
	@EventPattern(RABBITMQ_QUEUE.NOTIFICATION_QUEUE)
	async handleMessage(
		@Payload(new RabbitMQNotificationValidationPipe(NotificationQueueDto))
		data: NotificationQueueDto,
		@Ctx() context: RmqContext,
	) {
		const { type, recipient, payload, action } = data;

		this.logger.debug(
			this.i18n.t("rabbitmq.recieved-message", {
				args: {
					queue: RABBITMQ_QUEUE.NOTIFICATION_QUEUE,
					type,
					recipient,
					payload,
					action,
				},
			}),
		);

		const channel = context.getChannelRef();
		const originalMsg = context.getMessage();

		// Выполняем входящую задачу на нотификацию
		await this.notifier.notify(type, recipient, payload, action);

		// Вручную отправляем ack обратно на основной сервер (задача выполнилась успешно)
		channel.ack(originalMsg);
	}
}
