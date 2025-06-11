import { I18nService } from "nestjs-i18n";
import PincodesDto from "src/dto/tables/pincodes.dto";
import FileLogger from "src/services/logger.service";
import { INJECTION_KEYS } from "src/types/enums";
import { Repository } from "typeorm";
import { DataSource } from "typeorm";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

// Сервис для управления репозиторием TypeOrm таблицы Pincodes
@Injectable()
export default class PincodesService implements OnModuleInit {
    private pincodesRepository: Repository<PincodesDto>;

    constructor(
        @Inject(INJECTION_KEYS.DATABASE)
        private readonly dataSource: DataSource,
        private readonly logger: FileLogger,
        private readonly i18n: I18nService,
    ) {
        this.logger.setContext(PincodesService.name);
    }

    onModuleInit() {
        this.pincodesRepository = this.dataSource.getRepository(PincodesDto);
    }

    async findAll(): Promise<PincodesDto[]> {
        this.logger.debug(this.i18n.t("notifications.pincodes.find_all"));
        return this.pincodesRepository.find();
    }

    async findOne(id: number): Promise<PincodesDto | null> {
        this.logger.debug(
            this.i18n.t("notifications.pincodes.find_one", {
                args: { id },
            }),
        );
        return this.pincodesRepository.findOneBy({ id });
    }

    async create(
        data: Omit<PincodesDto, "id">,
    ): Promise<PincodesDto> {
        this.logger.debug(this.i18n.t("notifications.pincodes.create"));
        const pincode = this.pincodesRepository.create(data);
        return this.pincodesRepository.save(pincode);
    }

    async update(
        id: number,
        data: Partial<PincodesDto>,
    ): Promise<PincodesDto> {
        this.logger.debug(
            this.i18n.t("notifications.pincodes.update", {
                args: { id },
            }),
        );
        await this.pincodesRepository.update(id, data);
        return this.findOne(id) as Promise<PincodesDto>;
    }

    async remove(id: number): Promise<void> {
        this.logger.debug(
            this.i18n.t("notifications.pincodes.remove", {
                args: { id },
            }),
        );
        await this.pincodesRepository.delete(id);
    }
}
