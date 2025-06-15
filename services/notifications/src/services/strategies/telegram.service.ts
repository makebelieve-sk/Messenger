import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import NotificationStrategy from "src/interfaces/notification.interface";
import FileLogger from "src/services/logger.service";
import NodeTelegramService from "src/services/node-telegram.service";
import NodemailerService from "src/services/nodemailer.service";
import RedisService from "src/services/redis.service";
import BaseStrategyService from "src/services/strategies/base.service";
import PincodesService from "src/services/tables/pincodes.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import UsersService from "src/services/tables/users.service";
import { NOTIFICATION_TYPE, STRATEGY_ACTION } from "src/types/enums";
import { Injectable } from "@nestjs/common";

// Сервис, содержит методы реализации со стратегией отправки уведомлений в телеграмм канал
@Injectable()
export default class TelegramService
	extends BaseStrategyService
	implements NotificationStrategy
{
	private recipient!: string;
	private payload!: PayloadNotificationDto;
	private action!: STRATEGY_ACTION;
	private pincode!: number;

	constructor(
		private readonly nodemailerService: NodemailerService,
		private readonly nodeTelegramService: NodeTelegramService,
		private readonly logger: FileLogger,
		protected readonly sentNotificationsService: SentNotificationsService,
		protected readonly pincodesService: PincodesService,
		protected readonly i18n: I18nService,
		protected readonly usersService: UsersService,
		protected readonly redisService: RedisService,
		protected readonly telegramUsersService: TelegramUsersService,
	) {
		super(NOTIFICATION_TYPE.TELEGRAM);
	}

	async send(
		recipient: string,
		payload: PayloadNotificationDto,
		action: STRATEGY_ACTION,
	): Promise<void> {
		this.logger.log(
			this.i18n.t("telegram.tg-send", {
				args: { recipient, payload: JSON.stringify(payload), action },
			}),
		);

		this.recipient = recipient;
		this.payload = payload;
		this.action = action;

		const telegramId = (await super.getField(this.recipient)) as number;

		const message = await this.getMessage();

		await this.nodeTelegramService.notifyUser(telegramId, message, {
			parse_mode: "HTML",
		});

		// Обновляем записи в базе данных (новые уведомление и пинкод)
		await super.updateDatabase(
			this.recipient,
			this.payload,
			this.action,
			this.pincode,
		);
	}

	private async getMessage() {
		switch (this.action) {
			case STRATEGY_ACTION.PINCODE:
				this.pincode = await super.getPincode(this.recipient);

				return (
					`<b>${this.i18n.t("telegram.password_recovery.title")}</b>\n\n` +
					`${this.i18n.t("telegram.password_recovery.your_pincode")}: <code>${this.pincode}</code>\n\n` +
					`• ${this.i18n.t("telegram.password_recovery.pincode")}\n\n` +
					`<i>${this.i18n.t("telegram.password_recovery.thanks")}</i>`
				);
			case STRATEGY_ACTION.LOGIN:
				return (
					`<b>${this.i18n.t("telegram.security_notification.title")}</b>\n\n` +
					`${this.i18n.t("telegram.security_notification.message")}\n\n` +
					`<i>${this.i18n.t("telegram.security_notification.contact_support")}: ${this.nodemailerService.supportMail}</i>`
				);
			case STRATEGY_ACTION.NEW_NOTIFICATION:
				const { userName, title, mainText, text } = this.payload;

				return (
					`<b>${title}</b>\n` +
					`${this.i18n.t("telegram.new_notification.from")}: ${userName}\n\n` +
					`${mainText}` +
					`${text ? `\n${text}` : ""}\n\n` +
					`<i>${this.i18n.t("telegram.new_notification.best_regards")}, ${this.i18n.t("telegram.new_notification.team")}</i>`
				);
			default:
				return "";
		}
	}
}
