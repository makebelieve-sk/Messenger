import { I18nService } from "nestjs-i18n";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import PincodesService from "src/services/tables/pincodes.service";
import { RABBITMQ_QUEUE, RabbitMQ_SEND_TYPE } from "src/types/enums";
import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectDataSource } from "@nestjs/typeorm";

// Сервис по проверке статуса здоровья базы данных
@Injectable()
export default class CheckHealthDatabaseService {
	constructor(
		@InjectDataSource()
		private readonly dataSource: DataSource,
		private readonly pincodesService: PincodesService,
		private readonly rabbit: RabbitMQService,
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(CheckHealthDatabaseService.name);
	}

	// Пингуем БД каждые 30 секунд
	@Cron("*/30 * * * * *")
	async pingDb() {
		try {
			this.logger.log(this.i18n.t("database.ping_database"));
			await this.dataSource.query("SELECT 1");
		} catch (err) {
			const msg = this.i18n.t("database.errors.connection_failed", {
				args: { error: err.message },
			});
			this.logger.error(msg);
			this.rabbit.sendErrorMessage(RABBITMQ_QUEUE.ERROR_QUEUE, {
				type: RabbitMQ_SEND_TYPE.MSSQL_ERROR,
				reason: msg,
				at: new Date().toISOString(),
			});
		}
	}

	// Запуск каждый час
	@Cron(CronExpression.EVERY_HOUR)
	async deleteOldPincodes() {
		this.logger.log(this.i18n.t("database.delete_old_pincodes.start"));

		try {
			await this.pincodesService.deleteOldPincodes();

			this.logger.log(this.i18n.t("database.delete_old_pincodes.success"));
		} catch (error) {
			this.logger.error(
				this.i18n.t("database.delete_old_pincodes.error", { args: { error } }),
			);
		}
	}
}
