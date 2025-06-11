import Redis from "ioredis";
import { RabbitMQConfig } from "src/configs/rabbitmq.config";
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

		// Получаем конфиг RabbitMQ
		const config: RabbitMQConfig | undefined = app
			.get(ConfigService)
			.get(CONFIG_TYPE.RABBITMQ_NOTIFICATION);

		if (!config) {
			throw new ConfigError("unavailable recieved RabbitMQNotification config");
		}

		// Подключаем RabbitMQ-микросервис (это используется только для приема сообщений)
		app.connectMicroservice<MicroserviceOptions>({
			transport: config.transport,
			options: {
				...config.options,
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

		await redisClient.publish(REDIS_CHANNEL.CRITICAL_ERRORS, data);
	} catch (error) {
		logger.error(
			`Failed to send critical error to Redis by channel "${REDIS_CHANNEL.CRITICAL_ERRORS}": ${error.message}`,
		);
	}
}

bootstrap();

// TODO:
// 1) дописать readme
// 2) реализовать отправку письма на почту (после успеха записать результат в БД)
// 3) реализовать отправку уведомления в телеграмм канал (также записать в БД)
// 4) реализовать отправку уведомления по СМС (также запись в БД - вынести этот метод в родитель - BaseService)
// 5) Написать чедулер на удаление неиспользуемых пинкодов (1 раз в день можно - проверять по времени).
