import { I18nService } from "nestjs-i18n";
import UsersDto from "src/dto/tables/users.dto";
import FileLogger from "src/services/logger.service";
import BaseRepositoryService from "src/services/tables/base.service";
import { DeepPartial, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

// Сервис для управления репозиторием TypeOrm таблицы Users
@Injectable()
export default class UsersService extends BaseRepositoryService<UsersDto> {
	constructor(
		@InjectRepository(UsersDto)
		protected readonly usersRepository: Repository<UsersDto>,
		protected readonly logger: FileLogger,
		protected readonly i18n: I18nService,
	) {
		super(usersRepository);

		this.logger.setContext(UsersService.name);
	}

	override findOne(id: string): Promise<UsersDto | null> {
		this.logger.debug(
			this.i18n.t("notifications.users.find_one", {
				args: { id },
			}),
		);
		return super.findOne(id);
	}

	override findOneBy(data: DeepPartial<UsersDto>): Promise<UsersDto> {
		this.logger.debug(
			this.i18n.t("notifications.users.find_one_by", {
				args: { data: JSON.stringify(data) },
			}),
		);
		return super.findOneBy(data);
	}
}
