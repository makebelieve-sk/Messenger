import { Module } from '@nestjs/common';
import TelegramService from '../services/strategies/telegram.service';

// Модуль отправки уведомлений в телеграмм канал
@Module({
  providers: [TelegramService],
  exports: [TelegramService],
})
export default class TelegramModule {}