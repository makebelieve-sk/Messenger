import { Inject, Injectable } from '@nestjs/common';
import NotificationStrategy from '../interfaces/notification.interface';
import { INJECTION_KEYS } from 'src/types/enums';

// Сервис, содержит методы реализации управления стратегией
@Injectable()
export default class NotificationService {
    constructor(
        @Inject(INJECTION_KEYS.NOTIFICATION_STRATEGY)
        private readonly strategy: NotificationStrategy,
    ) { }

    async notify(recipient: string, payload: any): Promise<void> {
        await this.strategy.send(recipient, payload);
    }
}