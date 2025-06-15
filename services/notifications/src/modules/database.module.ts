import { I18nService } from "nestjs-i18n";
import { DatabaseConfig } from "src/configs/database.config";
import ConfigError from "src/errors/config.error";
import { CONFIG_TYPE } from "src/types/enums";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

/**
 * Модуль базы данных MS SQL с TypeORM.
 * Модуль глобален, так как используется во всех моделей таблиц сервиса и также, исключает циклические зависимости.
 */
@Global()
@Module({
	imports: [
		ConfigModule,
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService, I18nService],
			useFactory: async (config: ConfigService, i18n: I18nService) => {
				const databaseConfig = config.get<DatabaseConfig>(CONFIG_TYPE.DATABASE);

				if (!databaseConfig) {
					throw new ConfigError(i18n.t("database.errors.config_unavailable"));
				}

				return databaseConfig;
			},
		}),
	],
	exports: [TypeOrmModule],
})
export default class DatabaseModule {}
