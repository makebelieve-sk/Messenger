import NotificationService from "src/services/notification.service";
import EmailService from "src/services/strategies/email.service";
import SMSService from "src/services/strategies/sms.service";
import TelegramService from "src/services/strategies/telegram.service";
import { INJECTION_KEYS, NOTIFICATION_TYPE } from "src/types/enums";
import { Module, Provider } from "@nestjs/common";
import PincodesModule from "src/modules/tables/pincodes.module";

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
	imports: [PincodesModule],
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
