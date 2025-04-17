import type { Sequelize, Transaction } from "sequelize";

import createFilesInMessage, { type CreationAttributes, FileInMessage } from "@core/database/models/file-in-message";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

export default class FilesInMessage {
	private _model: typeof FileInMessage;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createFilesInMessage(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "FilesInMessage", method: "create" }) + (error as Error).message);
		}
	}
}
