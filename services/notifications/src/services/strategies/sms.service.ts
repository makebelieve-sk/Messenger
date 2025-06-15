import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import StrategyError from "src/errors/strategy.error";
import NotificationStrategy from "src/interfaces/notification.interface";
import FileLogger from "src/services/logger.service";
import BaseStrategyService from "src/services/strategies/base.service";
import { NOTIFICATION_TYPE, STRATEGY_ACTION } from "src/types/enums";
import { Injectable } from "@nestjs/common";

// Сервис, содержит методы реализации со стратегией отправки уведомлений по СМС
@Injectable()
export default class SMSService
	extends BaseStrategyService
	implements NotificationStrategy
{
	constructor(
		private readonly logger: FileLogger,
		protected readonly i18n: I18nService,
	) {
		super(NOTIFICATION_TYPE.SMS);
	}

	async send(
		recipient: string,
		payload: PayloadNotificationDto,
		action: STRATEGY_ACTION,
	): Promise<void> {
		this.logger.log(
			this.i18n.t("strategies.sms-send", {
				args: { recipient, payload: JSON.stringify(payload), action },
			}),
		);

		// СМС стратегия в большинстве сервисов платная, а количество бесплатных жестко ограничено (не в месяц, а вообще на весь период)
		throw new StrategyError(this.i18n.t("strategies.sms-not-implemented"));
	}
}
