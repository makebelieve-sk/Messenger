import { I18nService } from "nestjs-i18n";
import PincodesDto from "src/dto/tables/pincodes.dto";
import SentNotificationsDto from "src/dto/tables/sent-notifications.dto";
import TelegramUsersDto from "src/dto/tables/telegram-users.dto";
import UsersDto from "src/dto/tables/users.dto";
import DatabaseError from "src/errors/database.error";
import FileLogger from "src/services/logger.service";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { Inject, Injectable } from "@nestjs/common";

type DtoType = UsersDto | PincodesDto | SentNotificationsDto | TelegramUsersDto;

// Базовый абстрактный класс для управления репозиторями таблиц TypeOrm
@Injectable()
export default abstract class BaseRepositoryService<T extends DtoType> {
	@Inject(I18nService) protected readonly i18n!: I18nService;
	@Inject(FileLogger) protected readonly logger!: FileLogger;

	protected constructor(protected readonly repository: Repository<T>) {}

	protected findAll(): Promise<T[]> {
		return this.repository.find();
	}

	protected findOne(id: T["id"]): Promise<T | null> {
		return this.repository.findOneBy({ id } as FindOptionsWhere<T>);
	}

	protected async findOneBy(data: DeepPartial<T>): Promise<T> {
		const entity = await this.repository.findOneBy(data as FindOptionsWhere<T>);

		if (!entity) {
			throw new DatabaseError(
				this.i18n.t("database.errors.entity_not_found", {
					args: { id: data?.id || undefined },
				}),
			);
		}

		return entity;
	}

	protected create(data: DeepPartial<T>): Promise<T> {
		const entity = this.repository.create(data);
		return this.repository.save(entity);
	}

	protected async update(id: T["id"], data: DeepPartial<T>): Promise<T> {
		const entity = await this.findOne(id);

		if (!entity) {
			throw new DatabaseError(
				this.i18n.t("database.errors.entity_not_found", { args: { id } }),
			);
		}

		return await this.repository.save({
			...entity,
			...data,
		});
	}

	protected remove(id: T["id"]) {
		return this.repository.delete(id);
	}
}
