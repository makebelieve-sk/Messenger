import type { Sequelize, Transaction } from "sequelize";

import createMessages, { type CreationAttributes, Message } from "@core/database/models/message";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью Message
export default class Messages {
	private _model: typeof Message;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createMessages(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "Messages", method: "create" }) + (error as Error).message);
		}
	}
}
