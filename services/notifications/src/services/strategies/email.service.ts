import NotificationStrategy from "src/interfaces/notification.interface";
import { Injectable } from "@nestjs/common";
import { STRATEGY_ACTION } from "src/types/enums";

// Сервис, содержит методы реализации со стратегией отправки уведомлений на почту
@Injectable()
export default class EmailService implements NotificationStrategy {
	async send(recipient: string, payload: unknown, action: STRATEGY_ACTION): Promise<void> {
		console.log(`EmailStrategy: sending email to ${recipient}`, payload, action);
	}
}
