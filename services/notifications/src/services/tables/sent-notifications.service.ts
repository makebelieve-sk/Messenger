import { I18nService } from "nestjs-i18n";
import SentNotificationsDto from "src/dto/tables/sent-notifications.dto";
import FileLogger from "src/services/logger.service";
import BaseRepositoryService from "src/services/tables/base.service";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

// Сервис для управления репозиторием TypeOrm таблицы Sent_Notifications
@Injectable()
export default class SentNotificationsService extends BaseRepositoryService<SentNotificationsDto> {
	constructor(
		@InjectRepository(SentNotificationsDto)
		protected readonly sentNotificationsRepository: Repository<SentNotificationsDto>,
		protected readonly logger: FileLogger,
		protected readonly i18n: I18nService,
	) {
		super(sentNotificationsRepository);

		this.logger.setContext(SentNotificationsService.name);
	}

	override create(
		data: Omit<SentNotificationsDto, "id" | "createdAt">,
	): Promise<SentNotificationsDto> {
		this.logger.debug(this.i18n.t("notifications.sent_notifications.create"));
		return super.create(data);
	}
}
