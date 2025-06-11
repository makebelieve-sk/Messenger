import { I18nService } from "nestjs-i18n";
import { DatabaseConfig } from "src/configs/database.config";
import ConfigError from "src/errors/config.error";
import RabbitMQModule from "src/modules/rabbitmq.module";
import DatabaseService from "src/services/database.service";
import { CONFIG_TYPE, INJECTION_KEYS } from "src/types/enums";
import { DataSource } from "typeorm";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

/**
 * Модуль базы данных MS SQL с TypeORM.
 * Модуль глобален, так как используется во всех моделй таблиц сервиса и также, исключает циклические зависимости.
 */
@Global()
@Module({
	imports: [ConfigModule, RabbitMQModule],
	providers: [
		{
			provide: INJECTION_KEYS.DATABASE,
			useFactory: (config: ConfigService, i18n: I18nService) => {
				const databaseConfig: DatabaseConfig | undefined = config.get(
					CONFIG_TYPE.DATABASE,
				);

				if (!databaseConfig) {
					throw new ConfigError(i18n.t("database.errors.config_unavailable"));
				}

				return new DataSource(databaseConfig);
			},
			inject: [ConfigService, I18nService],
		},
		DatabaseService,
	],
	exports: [DatabaseService, INJECTION_KEYS.DATABASE],
})
export default class DatabaseModule {}
