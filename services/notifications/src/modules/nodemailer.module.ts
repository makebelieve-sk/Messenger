import { I18nService } from "nestjs-i18n";
import { createTransport } from "nodemailer";
import { NodemailerConfig } from "src/configs/nodemailer.config";
import ConfigError from "src/errors/config.error";
import NodemailerService from "src/services/nodemailer.service";
import { CONFIG_TYPE, INJECTION_KEYS } from "src/types/enums";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientsModule } from "@nestjs/microservices";

// Модуль для отправки письма на почту
@Module({
	imports: [ClientsModule],
	providers: [
		{
			provide: INJECTION_KEYS.NODEMAILER_SERVER,
			useFactory: (config: ConfigService, i18n: I18nService) => {
				const nodemailerConfig: NodemailerConfig | undefined = config.get(
					CONFIG_TYPE.NODEMAILER,
				);

				if (!nodemailerConfig) {
					throw new ConfigError(i18n.t("nodemailer.config_error"));
				}

				return createTransport({
					host: nodemailerConfig.host,
					port: nodemailerConfig.port,
					secure: nodemailerConfig.secure,
					auth: nodemailerConfig.auth,
				});
			},
			inject: [ConfigService, I18nService],
		},
		NodemailerService,
	],
	exports: [NodemailerService],
})
export default class NodeMailerModule {}
