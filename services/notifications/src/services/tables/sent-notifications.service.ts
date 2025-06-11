import { I18nService } from "nestjs-i18n";
import SentNotificationsDto from "src/dto/tables/sent-notifications.dto";
import FileLogger from "src/services/logger.service";
import { INJECTION_KEYS } from "src/types/enums";
import { Repository } from "typeorm";
import { DataSource } from "typeorm";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

// Сервис для управления репозиторием TypeOrm таблицы Sent_Notifications
@Injectable()
export default class SentNotificationsService implements OnModuleInit {
	private sentNotificationsRepository: Repository<SentNotificationsDto>;

	constructor(
		@Inject(INJECTION_KEYS.DATABASE)
		private readonly dataSource: DataSource,
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(SentNotificationsService.name);
	}

	onModuleInit() {
		this.sentNotificationsRepository = this.dataSource.getRepository(SentNotificationsDto);
	}

	async findAll(): Promise<SentNotificationsDto[]> {
		this.logger.debug(this.i18n.t("notifications.sent_notifications.find_all"));
		return this.sentNotificationsRepository.find();
	}

	async findOne(id: number): Promise<SentNotificationsDto | null> {
		this.logger.debug(
			this.i18n.t("notifications.sent_notifications.find_one", {
				args: { id },
			}),
		);
		return this.sentNotificationsRepository.findOneBy({ id });
	}

	async create(
		data: Omit<SentNotificationsDto, "id">,
	): Promise<SentNotificationsDto> {
		this.logger.debug(this.i18n.t("notifications.sent_notifications.create"));
		const sentNotification = this.sentNotificationsRepository.create(data);
		return this.sentNotificationsRepository.save(sentNotification);
	}

	async update(
		id: number,
		data: Partial<SentNotificationsDto>,
	): Promise<SentNotificationsDto> {
		this.logger.debug(
			this.i18n.t("notifications.sent_notifications.update", {
				args: { id },
			}),
		);
		await this.sentNotificationsRepository.update(id, data);
		return this.findOne(id) as Promise<SentNotificationsDto>;
	}

	async remove(id: number): Promise<void> {
		this.logger.debug(
			this.i18n.t("notifications.sent_notifications.remove", {
				args: { id },
			}),
		);
		await this.sentNotificationsRepository.delete(id);
	}
}
