import SMSService from "src/services/strategies/sms.service";
import { Module } from "@nestjs/common";

// Модуль отправки уведомлений по СМС
@Module({
	providers: [SMSService],
	exports: [SMSService],
})
export default class SMSModule {}
