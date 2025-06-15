import Redis from "ioredis";
import { I18nService } from "nestjs-i18n";
import { RedisConfig } from "src/configs/redis.config";
import RedisController from "src/controllers/redis.controller";
import ConfigError from "src/errors/config.error";
import { NotificationModule } from "src/modules/notification.module";
import PincodesModule from "src/modules/tables/pincodes.module";
import RedisService from "src/services/redis.service";
import { CONFIG_TYPE, INJECTION_KEYS } from "src/types/enums";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule } from "@nestjs/microservices";

// Глобальный модуль подключения к серверу Redis
@Global()
@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: INJECTION_KEYS.REDIS_SERVER,
				imports: [ConfigModule],
				useFactory: (config: ConfigService, i18n: I18nService) => {
					const redisConfig: RedisConfig | undefined = config.get(CONFIG_TYPE.REDIS);

					if (!redisConfig) {
						throw new ConfigError(i18n.t("redis.config_error.global"));
					}

					return {
						transport: redisConfig.transport,
						options: redisConfig.options,
					};
				},
				inject: [ConfigService, I18nService],
			},
		]),
		NotificationModule,
		PincodesModule,
	],
	providers: [
		RedisService,
		// Генерируем низкоуровневый ioredis сервер для более детального контроля над каналами, подписками и методами
		{
			provide: INJECTION_KEYS.IOREDIS_OPTIONS,
			useFactory: (config: ConfigService, i18n: I18nService) => {
				const redisConfig = config.get<RedisConfig>(CONFIG_TYPE.REDIS);

				if (!redisConfig) {
					throw new ConfigError(i18n.t("redis.config_error.ioredis"));
				}

				return new Redis(redisConfig.options);
			},
			inject: [ConfigService, I18nService],
		},
	],
	controllers: [RedisController],
	exports: [RedisService],
})
export default class RedisModule {}
