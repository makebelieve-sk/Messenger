import { I18nService } from "nestjs-i18n";
import { Observable, tap } from "rxjs";
import FileLogger from "src/services/logger.service";
import { CONTEXT_TYPE } from "src/types/enums";
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from "@nestjs/common";
import { RmqContext } from "@nestjs/microservices";

/**
 * Перехватчик соединения RPC (RabbitMQ)
 * Сначала он перехватывает только входящие сообщения в любой очереди (в общем, где есть подписка @EventPattern)
 * После вызова next.handle() - то есть обработки этого сообщения, происходит обработка возвращаемого результата
 * при успехе или ошибке.
 */
@Injectable()
export default class RabbitLoggingInterceptor implements NestInterceptor {
	constructor(
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(RabbitLoggingInterceptor.name);
	}

	async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<Promise<void>>> {
		// Проверяем, что это RPC (RabbitMQ)
		if (context.getType() !== CONTEXT_TYPE.RPC) {
			return next.handle();
		}

		// Переключаемся на контекст RPC (RabbitMQ)
		const rpcContext = context.switchToRpc();
		// Получаем данные о сообщении
		const data = rpcContext.getData();

		// Получаем низкоуровневый RmqContext (контекст RabbitMQ внутри Nest.js), чтобы вытащить routingKey
		const rmqCtx = rpcContext.getContext<RmqContext>();
		const msg = rmqCtx.getMessage();
		const routingKey =
			msg.fields?.routingKey ?? this.i18n.t("rabbitmq.unknown_queue");

		const now = Date.now();
		this.logger.log(
			this.i18n.t("rabbitmq.message-received", {
				args: { routingKey, data: JSON.stringify(data) },
			}),
		);

		return next.handle().pipe(
			tap({
				next: () => {
					this.logger.log(
						this.i18n.t("rabbitmq.message-processed", {
							args: { time: Date.now() - now },
						}),
					);
				},
				error: (error: Error) => {
					this.logger.error(
						this.i18n.t("rabbitmq.message-error", {
							args: { time: Date.now() - now, error: error.message },
						}),
					);
				},
			}),
		);
	}
}
