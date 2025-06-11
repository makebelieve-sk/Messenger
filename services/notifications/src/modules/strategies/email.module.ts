import EmailService from "src/services/strategies/email.service";
import { Module } from "@nestjs/common";

// Модуль отправки уведомлений на почту
@Module({
	providers: [EmailService],
	exports: [EmailService],
})
export default class EmailModule {}
