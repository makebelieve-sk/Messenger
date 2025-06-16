import { STRATEGY_ACTION } from "common-types";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";

// Контракт, описывающий сервисы стратегий
export default interface NotificationStrategy {
	send(
		recipient: string,
		payload: PayloadNotificationDto,
		action: STRATEGY_ACTION,
	): Promise<void>;
}
