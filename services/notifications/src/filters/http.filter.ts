import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import { RABBITMQ_QUEUE, RabbitMQ_SEND_TYPE } from "src/types/enums";
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Injectable,
} from "@nestjs/common";

/**
 * Фильтр по перехвату всех HTTP ошибок в главном контроллере.
 * Если добавятся новые контроллеры - этот фильтр необходимо будет применить и к ним.
 */
@Injectable()
@Catch()
export default class HTTPExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly rabbitMQService: RabbitMQService,
		private readonly logger: FileLogger,
	) {
		this.logger.setContext(HTTPExceptionFilter.name);
	}

	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const request = ctx.getRequest<Request>();

		const errorText = `${request.method} ${status} ${request.url}: ${exception.message}`;

		this.logger.error(errorText, exception.stack || exception);

		/**
		 * Если ошибка серъезная (внутренняя или связанная с работой серисов, например, Redis/MS SQL),
		 * то публикуем её в очередь критических ошибок RabbitMQ для уведомления основного сервиса о критичной ошибке.
		 */
		if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
			// Отправляем сообщение об ошибке в очередь ошибок
			this.rabbitMQService.sendErrorMessage(RABBITMQ_QUEUE.ERROR_QUEUE, {
				type: RabbitMQ_SEND_TYPE.HTTP_ERROR,
				reason: errorText,
				at: new Date().toISOString(),
			});
		}

		const response = ctx.getResponse();

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			message: exception.message,
		});
	}
}
