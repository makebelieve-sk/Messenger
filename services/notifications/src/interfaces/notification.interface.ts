import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import { STRATEGY_ACTION } from "src/types/enums";

// Контракт, описывающий сервисы стратегий
export default interface NotificationStrategy {
	send(
		recipient: string,
		payload: PayloadNotificationDto,
		action: STRATEGY_ACTION,
	): Promise<void>;
}
