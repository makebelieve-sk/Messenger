import { Injectable } from '@nestjs/common';
import NotificationStrategy from '../../interfaces/notification.interface';

// Сервис, содержит методы реализации со стратегией отправки уведомлений на почту
@Injectable()
export default class EmailService implements NotificationStrategy {
    async send(recipient: string, payload: any): Promise<void> {
        console.log(`EmailStrategy: sending email to ${recipient}`, payload);
    }
}