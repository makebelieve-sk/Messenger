import { Module } from '@nestjs/common';
import EmailService from '../services/strategies/email.service';

// Модуль отправки уведомлений на почту
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export default class EmailModule {}