import NotificationStrategy from "src/interfaces/notification.interface";
import { Injectable } from "@nestjs/common";
import { STRATEGY_ACTION } from "src/types/enums";

// Сервис, содержит методы реализации со стратегией отправки уведомлений в телеграмм канал
@Injectable()
export default class TelegramService implements NotificationStrategy {
	async send(recipient: string, payload: unknown, action: STRATEGY_ACTION): Promise<void> {
		console.log(
			`TelegramStrategy: sending Telegram message to ${recipient}`,
			payload,
			action,
		);
	}
}
