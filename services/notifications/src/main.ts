import Redis from "ioredis";
import { RabbitMQConfig } from "src/configs/rabbitmq.config";
import { RedisConfig } from "src/configs/redis.config";
import AppError from "src/errors/app.error";
import ConfigError from "src/errors/config.error";
import GlobalFilter from "src/filters/global.filter";
import AppModule from "src/modules/app.module";
import FileLogger from "src/services/logger.service";
import { CONFIG_TYPE, REDIS_CHANNEL } from "src/types/enums";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const logger = new FileLogger("Bootstrap");

// Иницализация сервера
async function bootstrap() {
	const criticalRedis = createCriticalRedis();

	try {
		if (!criticalRedis) {
			throw new AppError("An error occurred while initializing a critical Redis");
		}

		// Необработанная асинхронная ошибка
		process.on("unhandledRejection", async (reason: string) => {
			logger.error("Unhandled Rejection", reason);
			await sendCriticalError(criticalRedis, "unhandledRejection", reason);

			process.exit(1);
		});

		// Необработанная синхронная ошибка
		process.on("uncaughtException", async (error: Error) => {
			logger.error("Uncaught Exception", error.stack);
			await sendCriticalError(criticalRedis, "uncaughtException", error.message);

			process.exit(1);
		});

		// Запускаем приложение Nest.js
		const app = await NestFactory.create(AppModule);

		logger.log(
			`Загружаем сервер в режиме ${process.env.NODE_ENV as string}. Порт: ${process.env.PORT}`,
		);

		// Настраиваем Swagger
		const swagger = new DocumentBuilder()
			.setTitle("Notifications API")
			.setDescription("Описание API сервиса уведомлений")
			.setVersion("1.0")
			.build();

		const document = SwaggerModule.createDocument(app, swagger);
		SwaggerModule.setup("api-docs", app, document);

		// Переопределяем логгер глобально
		app.useLogger(logger);
		// Включаем хуки "shutdown". Ловят как сигналы Node.js, так и критичные ошибки.
		app.enableShutdownHooks();
		// Инициализируем глобальный обработчик всех HTTP ошибок
		app.useGlobalFilters(app.get(GlobalFilter));

		// Получаем конфиг Redis
		const configRedis: RedisConfig | undefined = app
			.get(ConfigService)
			.get(CONFIG_TYPE.REDIS);

		if (!configRedis) {
			throw new ConfigError("unavailable recieved IORedis config");
		}

		// Подключаем Redis-микросервис для приема сообщений в каналах Redis
		app.connectMicroservice<MicroserviceOptions>({
			transport: configRedis.transport,
			options: configRedis.options,
		});

		// Получаем конфиг RabbitMQ
		const configRabbit: RabbitMQConfig | undefined = app
			.get(ConfigService)
			.get(CONFIG_TYPE.RABBITMQ_NOTIFICATION);

		if (!configRabbit) {
			throw new ConfigError("unavailable recieved RabbitMQNotification config");
		}

		// Подключаем RabbitMQ-микросервис (это используется только для приема сообщений)
		app.connectMicroservice<MicroserviceOptions>({
			transport: configRabbit.transport,
			options: {
				...configRabbit.options,
				noAck: false,
			},
		});

		// Запускаем все микросервисы и HTTP
		await app.startAllMicroservices();
		await app.listen(process.env.PORT || 8009);
	} catch (error) {
		logger.error("Ошибка во время старта сервера", error);

		if (criticalRedis) {
			await criticalRedis.quit();
			logger.log("Critical Redis client closed");
		}

		process.exit(1);
	}
}

// Создание критичного Redis клиента
function createCriticalRedis() {
	const criticalRedis = new Redis({
		host: process.env.REDIS_HOST as string,
		port: parseInt(process.env.REDIS_PORT as string),
	});

	return criticalRedis;
}

// Отправка критической ошибки с текущего сервера на основной
async function sendCriticalError(
	redisClient: Redis,
	type: string,
	errorData: string,
) {
	try {
		const data = JSON.stringify({
			type,
			error: errorData,
			timestamp: new Date().toISOString(),
			pid: process.pid,
		});

		redisClient.publish(REDIS_CHANNEL.CRITICAL_ERRORS, data);
	} catch (error) {
		logger.error(
			`Failed to send critical error to Redis by channel "${REDIS_CHANNEL.CRITICAL_ERRORS}": ${error.message}`,
		);
	}
}

bootstrap();

// На основном сервере:
// 0) Реализовать в задачке инструкцию как заходить к боту (оставить ссылку на него) и отправлять ему свой номер телефона (нажать на старт)
// 1) подписаться на критичные ошибки реббита (логировать их, вывести snackbar на клиенте)
// 2) подписаться на heartbeat редиса (логировать их, вывести snackbar на клиенте)
// 3) создать очереди для реббита для отправки данных нотификации
// 4) вынести общшие енамы в packages/common-types
// 5) после успешной смены пароля только что использованный пинкод удалять из редиса по каналу удаления пинкода
