import { I18nService } from "nestjs-i18n";
import PincodesDto from "src/dto/tables/pincodes.dto";
import FileLogger from "src/services/logger.service";
import BaseRepositoryService from "src/services/tables/base.service";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

// Сервис для управления репозиторием TypeOrm таблицы Pincodes
@Injectable()
export default class PincodesService extends BaseRepositoryService<PincodesDto> {
	constructor(
		@InjectRepository(PincodesDto)
		protected readonly pincodesRepository: Repository<PincodesDto>,
		protected readonly logger: FileLogger,
		protected readonly i18n: I18nService,
	) {
		super(pincodesRepository);

		this.logger.setContext(PincodesService.name);
	}

	override create(
		data: Omit<PincodesDto, "id" | "createdAt">,
	): Promise<PincodesDto> {
		this.logger.debug(this.i18n.t("notifications.pincodes.create"));
		return super.create(data);
	}

	async removeBy(data: Partial<PincodesDto>) {
		this.logger.debug(
			this.i18n.t("notifications.pincodes.remove_by", {
				args: { data: JSON.stringify(data) },
			}),
		);

		const foundPincodes = await super.findAllBy(data);

		if (!foundPincodes || !foundPincodes.length) {
			return;
		}

		return super.removeEntities(foundPincodes);
	}

	override remove(id: number) {
		this.logger.debug(
			this.i18n.t("notifications.pincodes.remove", {
				args: { id },
			}),
		);

		return super.remove(id);
	}

	async deleteOldPincodes() {
		await this.pincodesRepository
			.createQueryBuilder()
			.delete()
			.from("Pincodes")
			.where("created_at < DATEADD(MINUTE, -1, SYSDATETIME())")
			.execute();
	}
}
