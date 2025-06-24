import { I18nService } from "nestjs-i18n";
import TelegramUsersDto from "src/dto/tables/telegram-users.dto";
import FileLogger from "src/services/logger.service";
import BaseRepositoryService from "src/services/tables/base.service";
import { DeepPartial, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

// Сервис для управления репозиторием TypeOrm таблицы Telegram_Users
@Injectable()
export default class TelegramUsersService extends BaseRepositoryService<TelegramUsersDto> {
	constructor(
		@InjectRepository(TelegramUsersDto)
		protected readonly telegramUsersRepository: Repository<TelegramUsersDto>,
		protected readonly logger: FileLogger,
		protected readonly i18n: I18nService,
	) {
		super(telegramUsersRepository);

		this.logger.setContext(TelegramUsersService.name);
	}

	override create(
		data: Omit<TelegramUsersDto, "id">,
	): Promise<TelegramUsersDto> {
		this.logger.debug(this.i18n.t("notifications.telegram_users.create"));
		return super.create(data);
	}

	override findOneBy(
		data: DeepPartial<TelegramUsersDto>,
	): Promise<TelegramUsersDto> {
		this.logger.debug(
			this.i18n.t("notifications.users.find_one_by", {
				args: { data: JSON.stringify(data) },
			}),
		);
		return super.findOneBy(data);
	}
}
