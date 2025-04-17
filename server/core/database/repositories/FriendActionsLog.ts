import type { Sequelize, Transaction } from "sequelize";

import createFriendActionsLog, { type CreationAttributes, FriendActionLog } from "@core/database/models/friend-action-log";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью FriendActionLog
export default class FriendActionsLog {
	private _model: typeof FriendActionLog;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createFriendActionsLog(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "FriendActionsLog", method: "create" }) + (error as Error).message);
		}
	}
}
