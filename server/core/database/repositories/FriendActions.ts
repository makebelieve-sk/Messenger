import type { Sequelize, Transaction } from "sequelize";

import createFriendActions, { type CreationAttributes, FriendAction } from "@core/database/models/friend-action";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью User
export default class FriendActions {
	private _model: typeof FriendAction;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createFriendActions(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "FriendActions", method: "create" }) + (error as Error).message);
		}
	}
}
