import type { Sequelize, Transaction } from "sequelize";

import createUserPhotos, { type CreationAttributes, UserPhoto } from "@core/database/models/user-photo";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью UserPhoto
export default class UserPhotos {
	private _model: typeof UserPhoto;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createUserPhotos(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return await this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserPhotos", method: "create" }) + (error as Error).message);
		}
	}

	async bulkCreate({ records, transaction }: { records: CreationAttributes[]; transaction: Transaction; }) {
		try {
			return await this._model.bulkCreate(records, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserPhotos", method: "bulkCreate" }) + (error as Error).message);
		}
	}

	async destroy({ filters, transaction }: { filters: { userId: string; photoId?: string; }; transaction?: Transaction; }) {
		try {
			await this._model.destroy({ where: filters, transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserPhotos", method: "destroy" }) + (error as Error).message );
		}
	}
}
