import type { Sequelize, Transaction } from "sequelize";

import createChats, { Chat, type CreationAttributes } from "@core/database/models/chat";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

export default class Chats {
	private _model: typeof Chat;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createChats(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "Chats", method: "create" }) + (error as Error).message);
		}
	}
}
