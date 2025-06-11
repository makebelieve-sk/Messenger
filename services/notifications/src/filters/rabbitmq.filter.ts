import { EMPTY } from "rxjs";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import RabbitMQService from "src/services/rabbitmq.service";
import RedisService from "src/services/redis.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import { RABBITMQ_QUEUE, REDIS_CHANNEL } from "src/types/enums";
import { ArgumentsHost, Catch, Injectable } from "@nestjs/common";
import { BaseRpcExceptionFilter } from "@nestjs/microservices";
import { RmqContext } from "@nestjs/microservices";

/**
 * Общий обработчик исключений RPC (RabbitMQ).
 * Используется только для обработки исключений текущего сервиса RabbitMQ.
 */
@Injectable()
@Catch()
export default class RabbitMQExceptionFilter extends BaseRpcExceptionFilter {
	constructor(
		private readonly rabbitMQService: RabbitMQService,
		private readonly redisService: RedisService,
		private readonly sentNotificationsService: SentNotificationsService,
	) {
		super();
	}

	catch(exception: Error, host: ArgumentsHost) {
		// Переключить контекст на RPC (RabbitMQ)
		const ctx = host.switchToRpc();
		// Получить сам контекст RPC (RabbitMQ)
		const mqCtx = ctx.getContext<RmqContext>();
		// Получить оригинальный объект сообщения
		const msg = mqCtx.getMessage();
		// Получить канал/очередь
		const channel = mqCtx.getChannelRef();
		// Получить объект данных сообщения
		const data: NotificationQueueDto = ctx.getData();

		// Удаляем задачу из очереди при ошибке
		channel.nack(msg, false, false);

		const timestamp = Date.now();
		const error = exception.message || exception.stack || exception.toString();

		// Записываем упавшую задачу в канал Redis для последующей обработки (еще один шанс даем на выполнение)
		this.redisService.publish(REDIS_CHANNEL.FAILED_NOTIFICATIONS, data);

		// Записываем упавшую задачу в БД
		this.sentNotificationsService.create({
			recipientId: data.recipient,
			type: data.type,
			payload: data.payload as any,
			action: data.action,
			success: false,
			errorMessage: error,
			createdAt: new Date(timestamp),
		});

		// Отправляем сообщение в очередь ошибочно завершенных задач (упавшая задача)
		this.rabbitMQService.sendErrorNotificationMessage(
			RABBITMQ_QUEUE.ERROR_NOTIFICATION_QUEUE,
			{
				type: data.type,
				recipient: data.recipient,
				payload: data.payload,
				action: data.action,
			},
		);

		/**
		 * Важно:
		 * 1) Не вызываем super.catch(), потому что мы сделали всю обработку возникшей ошибки.
		 * 2) Возвращаем специально пустой поток данных, так как всю обработку мы реализовали и Nest.js требует возврата хоть
		 * какого то потока.
		 */

		return EMPTY;
	}
}
