import NodeTelegramModule from "src/modules/node-telegram.module";
import NodeMailerModule from "src/modules/nodemailer.module";
import TelegramService from "src/services/strategies/telegram.service";
import { Module } from "@nestjs/common";

// Модуль отправки уведомлений в телеграмм канал
@Module({
	imports: [NodeMailerModule, NodeTelegramModule],
	providers: [TelegramService],
	exports: [TelegramService],
})
export default class TelegramModule {}
