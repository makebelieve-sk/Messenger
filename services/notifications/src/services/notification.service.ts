import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import AppError from "src/errors/app.error";
import NotificationStrategy from "src/interfaces/notification.interface";
import FileLogger from "src/services/logger.service";
import {
	INJECTION_KEYS,
	NOTIFICATION_TYPE,
	STRATEGY_ACTION,
} from "src/types/enums";
import { Inject, Injectable } from "@nestjs/common";

// Сервис, содержит методы реализации управления стратегией
@Injectable()
export default class NotificationService {
	constructor(
		@Inject(INJECTION_KEYS.NOTIFICATION_STRATEGIES)
		private readonly strategies: Record<NOTIFICATION_TYPE, NotificationStrategy>,
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(NotificationService.name);
	}

	// Вызываем метод отправки уведомления у переданной стратегии
	async notify(
		type: NOTIFICATION_TYPE,
		recipient: string,
		payload: PayloadNotificationDto,
		action: STRATEGY_ACTION,
	): Promise<void> {
		this.logger.debug(
			this.i18n.t("notifications.notification.notify", {
				args: {
					recipient,
					type,
					payload: JSON.stringify(payload),
					action,
				},
			}),
		);

		const strategy = this.strategies[type];

		if (!strategy) {
			throw new AppError(
				this.i18n.t("notifications.notification.unknown_type", {
					args: { type },
				}),
			);
		}

		await strategy.send(recipient, payload, action);
	}
}
