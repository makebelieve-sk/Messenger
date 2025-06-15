import { I18nService } from "nestjs-i18n";
import TelegramBot from "node-telegram-bot-api";
import { NodeTelegramConfig } from "src/configs/telegram.config";
import ConfigError from "src/errors/config.error";
import TelegramUsersModule from "src/modules/tables/telegram-users.module";
import UsersModule from "src/modules/tables/users.module";
import NodeTelegramService from "src/services/node-telegram.service";
import { CONFIG_TYPE, INJECTION_KEYS } from "src/types/enums";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

// Модуль для отправки уведомления в телеграм бот
@Module({
	imports: [ConfigModule, UsersModule, TelegramUsersModule],
	providers: [
		{
			provide: INJECTION_KEYS.NODE_TELEGRAM,
			inject: [ConfigService, I18nService],
			useFactory: (config: ConfigService, i18n: I18nService) => {
				const nodemailerConfig: NodeTelegramConfig | undefined = config.get(
					CONFIG_TYPE.NODE_TELEGRAM,
				);

				if (!nodemailerConfig) {
					throw new ConfigError(i18n.t("telegram.config_error"));
				}

				return new TelegramBot(nodemailerConfig.token, nodemailerConfig.options);
			},
		},
		NodeTelegramService,
	],
	exports: [INJECTION_KEYS.NODE_TELEGRAM, NodeTelegramService],
})
export default class NodeTelegramModule {}
