import { Body, Controller, Post } from '@nestjs/common';
import NotificationService from '../services/notification.service';

export class NotifyDto {
    recipient: string;
    payload: any;
}

// Контроллер, управляет сервисом в зависимости от входящих запросов
@Controller('notifications')
export default class NotificationController {
    constructor(private readonly notificationService: NotificationService) {
        this.send({ recipient: "test228", payload: 1488 });
    }

    @Post()
    async send(@Body() dto: NotifyDto) {
        await this.notificationService.notify(dto.recipient, dto.payload);
        return { status: 'sent' };
    }
}