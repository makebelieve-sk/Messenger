import type { Sequelize, Transaction } from "sequelize";

import createUsersInChat, { type CreationAttributes, UserInChat } from "@core/database/models/user-in-chat";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью UserInChat
export default class UsersInChat {
	private _model: typeof UserInChat;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createUsersInChat(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UsersInChat", method: "create" }) + (error as Error).message);
		}
	}
}
