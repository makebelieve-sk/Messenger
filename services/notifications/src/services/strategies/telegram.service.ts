import { Injectable } from '@nestjs/common';
import NotificationStrategy from '../../interfaces/notification.interface';

// Сервис, содержит методы реализации со стратегией отправки уведомлений в телеграмм канал
@Injectable()
export default class TelegramService implements NotificationStrategy {
    async send(recipient: string, payload: any): Promise<void> {
        console.log(`TelegramStrategy: sending Telegram message to ${recipient}`, payload);
    }
}