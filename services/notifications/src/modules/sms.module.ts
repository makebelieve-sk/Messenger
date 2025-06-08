import { Module } from '@nestjs/common';
import SMSService from '../services/strategies/sms.service';

// Модуль отправки уведомлений по СМС
@Module({
  providers: [SMSService],
  exports: [SMSService],
})
export default class SMSModule {}