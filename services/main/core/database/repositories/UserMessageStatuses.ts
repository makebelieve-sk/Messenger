import type { Sequelize, Transaction } from "sequelize";

import createUserMessageStatuses, { type CreationAttributes, UserMessageStatus } from "@core/database/models/user-message-status";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью UserMessageStatus
export default class UserMessageStatuses {
	private _model: typeof UserMessageStatus;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createUserMessageStatuses(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserMessageStatuses", method: "create" }) + (error as Error).message);
		}
	}

	async destroy({ filters, transaction }: { filters: { userId: string; }; transaction: Transaction; }) {
		try {
			return this._model.destroy({ where: filters, transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserMessageStatuses", method: "destroy" }) + (error as Error).message);
		}
	}
}
