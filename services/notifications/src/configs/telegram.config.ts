import { type ChatId } from "node-telegram-bot-api";
import { CONFIG_TYPE } from "src/types/enums";
import { registerAs } from "@nestjs/config";

export interface NodeTelegramConfig {
	token: string;
	options: {
		polling: boolean;
	};
	channelName: ChatId;
}

// Генерация конфига NodeTelegram с env переменными
const nodeTelegramConfig = registerAs<NodeTelegramConfig>(
	CONFIG_TYPE.NODE_TELEGRAM,
	() => ({
		token: process.env.TELEGRAM_BOT_TOKEN as string,
		options: {
			polling: true, // Используем polling, для вебхуков потребуются дополнительные настройки
		},
		channelName: process.env.TELEGRAM_CHANNEL_NAME as string,
	}),
);

export default nodeTelegramConfig;
