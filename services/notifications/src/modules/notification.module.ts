import NodeTelegramModule from "src/modules/node-telegram.module";
import NodeMailerModule from "src/modules/nodemailer.module";
import PincodesModule from "src/modules/tables/pincodes.module";
import SentNotificationsModule from "src/modules/tables/sent-notifications.module";
import TelegramUsersModule from "src/modules/tables/telegram-users.module";
import UsersModule from "src/modules/tables/users.module";
import NotificationService from "src/services/notification.service";
import EmailService from "src/services/strategies/email.service";
import SMSService from "src/services/strategies/sms.service";
import TelegramService from "src/services/strategies/telegram.service";
import { INJECTION_KEYS, NOTIFICATION_TYPE } from "src/types/enums";
import { Module, Provider } from "@nestjs/common";

// Список всех применяемых стратегий нотификации
const strategyProviders: Provider[] = [
	{
		provide: INJECTION_KEYS.EMAIL_STRATEGY,
		useClass: EmailService,
	},
	{
		provide: INJECTION_KEYS.SMS_STRATEGY,
		useClass: SMSService,
	},
	{
		provide: INJECTION_KEYS.TELEGRAM_STRATEGY,
		useClass: TelegramService,
	},
];

export interface NotificationModuleOptions {
	strategy: NOTIFICATION_TYPE;
}

// Точка входа в модуль нотификации. Этот модуль управляет поиском нужной стратегии отправки уведомления.
@Module({
	imports: [
		PincodesModule,
		NodeMailerModule,
		NodeTelegramModule,
		UsersModule,
		SentNotificationsModule,
		TelegramUsersModule,
	],
	providers: [
		...strategyProviders,
		{
			provide: INJECTION_KEYS.NOTIFICATION_STRATEGIES, // карта всех стратегий
			useFactory: (
				email: EmailService,
				sms: SMSService,
				telegram: TelegramService,
			) => ({
				[NOTIFICATION_TYPE.EMAIL]: email,
				[NOTIFICATION_TYPE.SMS]: sms,
				[NOTIFICATION_TYPE.TELEGRAM]: telegram,
			}),
			inject: [
				INJECTION_KEYS.EMAIL_STRATEGY,
				INJECTION_KEYS.SMS_STRATEGY,
				INJECTION_KEYS.TELEGRAM_STRATEGY,
			],
		},
		NotificationService,
	],
	exports: [NotificationService],
})
export class NotificationModule {}
