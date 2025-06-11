import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { NOTIFICATION_TYPE, RabbitMQ_SEND_TYPE, STRATEGY_ACTION } from "src/types/enums";

// Модель сообщения из очереди нотификаций
export class NotificationQueueDto {
	@IsEnum(NOTIFICATION_TYPE)
	@IsNotEmpty()
	type: NOTIFICATION_TYPE;

	@IsString()
	@IsNotEmpty()
	recipient: string;

	@IsNotEmpty()
	payload: unknown;

	@IsEnum(STRATEGY_ACTION)
	@IsNotEmpty()
	action: STRATEGY_ACTION;
}

// Модель сообщения из очереди критических ошибок
export class ErrorQueueDto {
	@IsEnum(RabbitMQ_SEND_TYPE)
	type: RabbitMQ_SEND_TYPE;

	@IsString()
	reason: string | undefined;

	@IsString()
	at: string;
}
