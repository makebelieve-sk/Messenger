import AppError from "src/errors/app.error";
import BaseError from "src/errors/base.error";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import { RABBITMQ_QUEUE, RabbitMQ_SEND_TYPE } from "src/types/enums";
import { Catch, ExceptionFilter, Injectable } from "@nestjs/common";

/**
 * Глобальный обработчик исключений всех пользовательских ошибок, которые возникают в сервисе.
 * Важно помнить, что на HTTP и RPC написаны свои пользовательские фильтры обработки ошибок.
 */
@Catch()
@Injectable()
export default class GlobalFilter implements ExceptionFilter {
	constructor(
		private readonly rabbitMQService: RabbitMQService,
		private readonly logger: FileLogger,
	) {
		this.logger.setContext(GlobalFilter.name);
	}

	catch(exception: Error) {
		const nextError =
			exception instanceof BaseError ? exception : new AppError(exception.message);

		const errorText = `Caught exception: ${nextError.message}.`;

		this.logger.error(errorText, nextError.stack);

		// Отправляем сообщение об ошибке в очередь ошибок
		this.rabbitMQService.sendErrorMessage(RABBITMQ_QUEUE.ERROR_QUEUE, {
			type: RabbitMQ_SEND_TYPE.APP_ERROR,
			reason: errorText,
			at: new Date().toISOString(),
		});
	}
}
