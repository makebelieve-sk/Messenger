import TelegramService from "src/services/strategies/telegram.service";
import { Module } from "@nestjs/common";

// Модуль отправки уведомлений в телеграмм канал
@Module({
	providers: [TelegramService],
	exports: [TelegramService],
})
export default class TelegramModule {}
