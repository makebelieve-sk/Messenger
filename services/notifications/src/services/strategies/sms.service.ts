import NotificationStrategy from "src/interfaces/notification.interface";
import { Injectable } from "@nestjs/common";
import { STRATEGY_ACTION } from "src/types/enums";
import PincodesService from "src/services/tables/pincodes.service";

// Сервис, содержит методы реализации со стратегией отправки уведомлений по СМС
@Injectable()
export default class SMSService implements NotificationStrategy {
	constructor(private readonly pincodesService: PincodesService) {}

	async send(recipient: string, payload: unknown, action: STRATEGY_ACTION): Promise<void> {
		console.log(`SmsStrategy: sending SMS to ${recipient}`, payload, action);
		
		await this.pincodesService.create({
			userId: recipient,
			pincode: 228228,
			expiresAt: new Date(),
			attempts: 0,
			createdAt: new Date(),
		});
	}
}
