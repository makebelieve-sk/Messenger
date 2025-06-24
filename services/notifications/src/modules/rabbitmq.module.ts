import { I18nService } from "nestjs-i18n";
import { RabbitMQConfig } from "src/configs/rabbitmq.config";
import RabbitMQController from "src/controllers/rabbitmq.controller";
import ConfigError from "src/errors/config.error";
import { NotificationModule } from "src/modules/notification.module";
import SentNotificationsModule from "src/modules/tables/sent-notifications.module";
import RabbitMQService from "src/services/rabbitmq.service";
import { CONFIG_TYPE, INJECTION_KEYS } from "src/types/enums";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule } from "@nestjs/microservices";

// Модуль для работы с RabbitMQ
@Module({
	imports: [
		// Настраиваем RabbitMQ на отправку сообщений в очереди нотификации и критических ошибок
		ClientsModule.registerAsync([
			{
				name: INJECTION_KEYS.RABBITMQ_NOTIFICATION_SERVER,
				imports: [ConfigModule],
				useFactory: (config: ConfigService, i18n: I18nService) => {
					const rmq: RabbitMQConfig | undefined = config.get(
						CONFIG_TYPE.RABBITMQ_NOTIFICATION,
					);

					if (!rmq) {
						throw new ConfigError(i18n.t("rabbitmq.config_error.notification"));
					}

					return {
						transport: rmq.transport,
						options: rmq.options,
					};
				},
				inject: [ConfigService, I18nService],
			},
			{
				name: INJECTION_KEYS.RABBITMQ_ERROR_NOTIFICATION_SERVER,
				imports: [ConfigModule],
				useFactory: (config: ConfigService, i18n: I18nService) => {
					const rmq: RabbitMQConfig | undefined = config.get(
						CONFIG_TYPE.RABBITMQ_ERROR_NOTIFICATION,
					);

					if (!rmq) {
						throw new ConfigError(i18n.t("rabbitmq.config_error.error_notification"));
					}

					return {
						transport: rmq.transport,
						options: rmq.options,
					};
				},
				inject: [ConfigService, I18nService],
			},
			{
				name: INJECTION_KEYS.RABBITMQ_ERROR_SERVER,
				imports: [ConfigModule],
				useFactory: (config: ConfigService, i18n: I18nService) => {
					const rmq: RabbitMQConfig | undefined = config.get(
						CONFIG_TYPE.RABBITMQ_ERROR,
					);

					if (!rmq) {
						throw new ConfigError(i18n.t("rabbitmq.config_error.error"));
					}

					return {
						transport: rmq.transport,
						options: rmq.options,
					};
				},
				inject: [ConfigService, I18nService],
			},
		]),
		NotificationModule,
		SentNotificationsModule,
	],
	providers: [RabbitMQService],
	controllers: [RabbitMQController],
	exports: [RabbitMQService],
})
export default class RabbitMQModule {}
