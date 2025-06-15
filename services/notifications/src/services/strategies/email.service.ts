import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import NotificationStrategy from "src/interfaces/notification.interface";
import FileLogger from "src/services/logger.service";
import NodemailerService from "src/services/nodemailer.service";
import RedisService from "src/services/redis.service";
import BaseStrategyService from "src/services/strategies/base.service";
import PincodesService from "src/services/tables/pincodes.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import UsersService from "src/services/tables/users.service";
import { NOTIFICATION_TYPE, STRATEGY_ACTION } from "src/types/enums";
import { Injectable } from "@nestjs/common";

// Сервис, содержит методы реализации со стратегией отправки уведомлений на почту
@Injectable()
export default class EmailService
	extends BaseStrategyService
	implements NotificationStrategy
{
	private recipient!: string;
	private payload!: PayloadNotificationDto;
	private action!: STRATEGY_ACTION;
	private pincode!: number;

	constructor(
		private readonly nodemailerService: NodemailerService,
		private readonly logger: FileLogger,
		protected readonly sentNotificationsService: SentNotificationsService,
		protected readonly pincodesService: PincodesService,
		protected readonly i18n: I18nService,
		protected readonly usersService: UsersService,
		protected readonly redisService: RedisService,
	) {
		super(NOTIFICATION_TYPE.EMAIL);
	}

	async send(
		recipient: string,
		payload: PayloadNotificationDto,
		action: STRATEGY_ACTION,
	): Promise<void> {
		this.logger.log(
			this.i18n.t("strategies.email-send", {
				args: { recipient, payload: JSON.stringify(payload), action },
			}),
		);

		this.recipient = recipient;
		this.payload = payload;
		this.action = action;

		const email = (await super.getField(this.recipient)) as string;

		const { subject, html } = await this.getMail();

		// Отправляем письмо на почту
		await this.nodemailerService.sendMail(email, subject, html);

		// Обновляем записи в базе данных (новые уведомление и пинкод)
		await super.updateDatabase(
			this.recipient,
			this.payload,
			this.action,
			this.pincode,
		);
	}

	private async getMail() {
		switch (this.action) {
			case STRATEGY_ACTION.PINCODE:
				this.pincode = await super.getPincode(this.recipient);

				return {
					subject: this.i18n.t("nodemailer.password_recovery.subject"),
					html: `
						<div style="width: 100%; background-color: #f9f9f9; padding: 40px 0; font-family: Arial, sans-serif;">
							<div style="max-width: 600px; background: white; margin: 0 auto; padding: 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
								<h1 style="text-align: center; color: #333; font-size: 24px;">
									${this.i18n.t("nodemailer.password_recovery.title")}
								</h1>
								<p style="text-align: center; font-size: 48px; margin: 40px 0; color: #2d89ef;">
									${this.pincode}
								</p>
								<p style="font-size: 16px; color: #666; text-align: center;">
									${this.i18n.t("nodemailer.password_recovery.pincode")}
								</p>
								<hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
								<p style="font-size: 14px; color: #888; text-align: center;">
									${this.i18n.t("nodemailer.password_recovery.regards")}<br/>
									${this.i18n.t("nodemailer.password_recovery.team")}
								</p>
								<p style="font-size: 14px; color: #888; text-align: center;">
									${this.i18n.t("nodemailer.password_recovery.security_notice")} 
									<a href="mailto:${this.nodemailerService.supportMail}" style="color: #2d89ef;">
										${this.nodemailerService.supportMail}
									</a>
								</p>
							</div>
						</div>
					`,
				};
			case STRATEGY_ACTION.LOGIN:
				return {
					subject: this.i18n.t("nodemailer.security_notification.subject"),
					html: `
						<div style="width: 100%; background-color: #f4f4f7; padding: 40px 0; font-family: Arial, sans-serif;">
							<div style="max-width: 600px; background: #ffffff; margin: 0 auto; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
								<h2 style="text-align: center; color: #333333; font-size: 22px; margin-bottom: 24px;">
									${this.i18n.t("nodemailer.security_notification.title")}
								</h2>
								<p style="font-size: 16px; color: #555555; line-height: 1.5; text-align: center;">
									${this.i18n.t("nodemailer.security_notification.message")}
								</p>
								<div style="height: 1px; background-color: #e1e1e1; margin: 32px 0;"></div>
								<p style="font-size: 14px; color: #777777; line-height: 1.5; text-align: center;">
									${this.i18n.t("nodemailer.security_notification.security_notice")}
									<a href="mailto:${this.nodemailerService.supportMail}" style="color: #1a73e8; text-decoration: none;">
										${this.nodemailerService.supportMail}
									</a>
								</p>
							</div>
						</div>
					`,
				};
			case STRATEGY_ACTION.NEW_NOTIFICATION:
				const { userName, avatarUrl, title, mainText, text } = this.payload;

				return {
					subject: this.i18n.t("nodemailer.new_notification.subject"),
					html: `
						<div style="width:100%;background:#f4f4f7;padding:30px 0;font-family:Arial,sans-serif;">
							<div style="max-width:600px;background:#fff;margin:0 auto;padding:30px;border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
								<h2 style="margin:0 0 20px;color:#333;font-size:20px;text-align:center;">
									${title}
								</h2>
								<div style="display:flex;align-items:center;margin-bottom:20px;">
									<img src="${avatarUrl}" alt="${userName}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;margin-right:15px;" />
									<div>
										<p style="margin:0;font-size:16px;color:#444;">
											${mainText}
										</p>
										${
											text
												? `<p style="margin:5px 0 0;font-size:14px;color:#666;line-height:1.4;">
												${text}
											</p>`
												: ""
										}
									</div>
								</div>
								<hr style="border:none;border-top:1px solid #e1e1e1;margin:20px 0;" />
								<p style="margin:0;font-size:14px;color:#777;text-align:center;line-height:1.5;">
									${this.i18n.t("nodemailer.new_notification.regards")}<br/>
									${this.i18n.t("nodemailer.new_notification.team")}
								</p>
							</div>
						</div>
					`,
				};
			default:
				return {
					subject: "",
					html: "",
				};
		}
	}
}
