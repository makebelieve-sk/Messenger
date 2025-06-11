import { I18nService } from "nestjs-i18n";
import AppInterface from "src/interfaces/app.interface";
import FileLogger from "src/services/logger.service";
import { Injectable } from "@nestjs/common";

// Сервис, содержит методы для обработки основных HTTP запросов
@Injectable()
export default class AppService implements AppInterface {
	constructor(
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(AppService.name);
	}

	healthcheck() {
		this.logger.debug(this.i18n.t("http.healthcheck"));

		return true;
	}
}
