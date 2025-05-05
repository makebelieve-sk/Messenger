import type { Sequelize, Transaction } from "sequelize";

import createDisabledChatsSound, { type CreationAttributes, DisabledChatSound } from "@core/database/models/disabled-chat-sound";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью DisabledChatSound
export default class DisabledChatsSound {
	private _model: typeof DisabledChatSound;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createDisabledChatsSound(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "DisabledChatsSound", method: "create" }) + (error as Error).message);
		}
	}

	async destroy({ filters, transaction }: { filters: { userId: string; }; transaction: Transaction; }) {
		try {
			return this._model.destroy({ where: filters, transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "DisabledChatsSound", method: "destroy" }) + (error as Error).message);
		}
	}
}
