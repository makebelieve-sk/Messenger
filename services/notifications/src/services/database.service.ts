import { I18nService } from "nestjs-i18n";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import {
	INJECTION_KEYS,
	RABBITMQ_QUEUE,
	RabbitMQ_SEND_TYPE,
} from "src/types/enums";
import { DataSource } from "typeorm";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

// Сервис для обработки хуков жизненного цикла при закрытии/остановке Nest.js приложения.
@Injectable()
export default class DatabaseService implements OnModuleInit {
	constructor(
		private readonly logger: FileLogger,
		@Inject(INJECTION_KEYS.DATABASE)
		private readonly dataSource: DataSource,
		private readonly rabbitMQService: RabbitMQService,
		private readonly i18n: I18nService,
	) {
		// Устанавливаем логгеру корректный контекст
		this.logger.setContext(DatabaseService.name);
	}

	async onModuleInit() {
		await this.dataSource.initialize();

		this.logger.log(this.i18n.t("database.success.connected"));

		await this.dataSource.runMigrations();

		this.logger.log(this.i18n.t("database.success.migrations_applied"));
	}

	// Каждые 30 секунд пингуем базу данных. Если перестала отвечать - пушим сообщение в критичную очередь сообщений RabbitMQ
	@Cron("*/30 * * * * *")
	async pingDB() {
		try {
			await this.dataSource.query("SELECT 1");
		} catch (error) {
			const errorMessage = this.i18n.t("database.errors.connection_failed", {
				args: { error },
			});
			this.logger.error(errorMessage);
			this.rabbitMQService.sendErrorMessage(RABBITMQ_QUEUE.ERROR_QUEUE, {
				type: RabbitMQ_SEND_TYPE.MSSQL_ERROR,
				reason: errorMessage,
				at: new Date().toISOString(),
			});
		}
	}

	async close() {
		await this.dataSource.destroy();
		this.logger.debug(this.i18n.t("database.success.closed"));
	}
}
