import { Injectable } from '@nestjs/common';
import NotificationStrategy from '../../interfaces/notification.interface';

// Сервис, содержит методы реализации со стратегией отправки уведомлений по СМС
@Injectable()
export default class SMSService implements NotificationStrategy {
    async send(recipient: string, payload: any): Promise<void> {
        console.log(`SmsStrategy: sending SMS to ${recipient}`, payload);
    }
}