import type { Sequelize, Transaction } from "sequelize";

import createFiles, { type CreationAttributes, File } from "@core/database/models/file";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью File
export default class Files {
	private _model: typeof File;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createFiles(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "Files", method: "create" }) + (error as Error).message);
		}
	}
}
