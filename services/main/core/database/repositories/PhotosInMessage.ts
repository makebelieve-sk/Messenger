import type { Sequelize, Transaction } from "sequelize";

import createPhotosInMessage, { type CreationAttributes, PhotoInMessage } from "@core/database/models/photo-in-message";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью PhotoInMessage
export default class PhotosInMessage {
	private _model: typeof PhotoInMessage;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createPhotosInMessage(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "PhotosInMessage", method: "create" }) + (error as Error).message);
		}
	}
}
