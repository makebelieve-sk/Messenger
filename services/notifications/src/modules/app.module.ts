import databaseConfig from "src/configs/database.config";
import {
	rabbitErrorConfig,
	rabbitErrorNotificationConfig,
	rabbitNotificationConfig,
} from "src/configs/rabbitmq.config";
import redisConfig from "src/configs/redis.config";
import AppController from "src/controllers/app.controller";
import GlobalFilter from "src/filters/global.filter";
import DatabaseModule from "src/modules/database.module";
import GlobalI18nModule from "src/modules/i18n.module";
import LoggerModule from "src/modules/logger.module";
import RabbitMQModule from "src/modules/rabbitmq.module";
import RedisModule from "src/modules/redis.module";
import AppService from "src/services/app.service";
import GracefulShutdownService from "src/services/graceful-shutdown.service";
import validateEnv from "src/utils/validate-env";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

// Главный модуль сервера
@Module({
	imports: [
		ScheduleModule.forRoot(), // Без инициализации декораторы планировщика (cron) работать не будут
		ConfigModule.forRoot({
			isGlobal: true, // делает ConfigService доступным в любом модуле
			envFilePath:
				process.env.NODE_ENV === "production"
					? [".env.production", ".env"]
					: [".env.development", ".env"],
			load: [
				rabbitNotificationConfig,
				rabbitErrorNotificationConfig,
				rabbitErrorConfig,
				redisConfig,
				databaseConfig,
			], // загружаем конфиг RabbitMQ (потому что в нем используются env переменные)
			validate: validateEnv, // Добавляем валидацию env переменным
		}),
		GlobalI18nModule,
		LoggerModule,
		RedisModule,
		RabbitMQModule,
		DatabaseModule,
	],
	controllers: [AppController],
	providers: [GracefulShutdownService, GlobalFilter, AppService],
})
export default class AppModule {}
