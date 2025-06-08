import { DynamicModule, Module, Provider } from '@nestjs/common';
import NotificationService from '../services/notification.service';
import NotificationController from '../controllers/notification.controller';
import EmailModule from './email.module';
import SMSModule from '../services/strategies/sms.service';
import TelegramModule from '../services/strategies/telegram.service';
import EmailService from 'src/services/strategies/email.service';
import SMSService from '../services/strategies/sms.service';
import TelegramService from '../services/strategies/telegram.service';
import { INJECTION_KEYS, NotificationType } from 'src/types/enums';

export interface NotificationModuleOptions {
    strategy: NotificationType;
};

// Точка входа в модуль нотификации. Этот модуль управляет поиском нужной стратегии отправки уведомления.
@Module({})
export class NotificationModule {
    // Статичный метод (указан в документации). Регистрация модуля и всех его зависимостей.
    static register(options: NotificationModuleOptions): DynamicModule {
        // Ищем нужную нам стратегию в зависимости от переданного типа
        const strategy = NotificationModule.getStrategy(options.strategy);

        /**
         * Кастомизация провайдера - указание провайдера выбранной стратегии для его использования
         * в сервисе нотификации (NotificationService)
         */
        const StrategyProvider: Provider = {
            provide: INJECTION_KEYS.NOTIFICATION_STRATEGY,
            useClass: strategy.service,
        };

        return {
            module: NotificationModule,
            imports: [strategy.module],
            providers: [StrategyProvider, NotificationService],
            controllers: [NotificationController],
            exports: [NotificationService],
        };
    }

    // Статический метод получения нужной стратегии нотификации
    static getStrategy(type: NotificationType) {
        switch (type) {
            case NotificationType.EMAIL:
                return {
                    module: EmailModule,
                    service: EmailService,
                };
            case NotificationType.SMS:
                return {
                    module: SMSModule,
                    service: SMSService,
                };
            case NotificationType.TELEGRAM:
                return  {
                    module: TelegramModule,
                    service: TelegramService,
                };
            default:
                throw new Error('Invalid notification type');
        }
    }
}