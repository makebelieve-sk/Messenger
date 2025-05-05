import type { Sequelize, Transaction } from "sequelize";

import createUserDetails, { type CreationAttributes, UserDetail } from "@core/database/models/user-detail";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

// Репозиторий, который содержит методы по работе с моделью UserDetails
export default class UserDetails {
	private _model: typeof UserDetail;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createUserDetails(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction: Transaction; }) {
		try {
			const newUserDetails = await this._model.create(creationAttributes, {
				transaction,
			});

			return newUserDetails.getEntity();
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserDetails", method: "create" }) + (error as Error).message);
		}
	}

	async getById({ userId, transaction }: { userId: string; transaction?: Transaction; }) {
		try {
			return await this._model.findByPk(userId, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserDetails", method: "getById" }) + (error as Error).message);
		}
	}

	async findOneBy({ filters, transaction }: { filters: { userId: string; }; transaction?: Transaction; }) {
		try {
			return await this._model.findOne({ where: filters, transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserDetails", method: "findOneBy" }) + (error as Error).message);
		}
	}

	async updateLastSeen(userId: string, lastSeen: string | null = null) {
		try {
			await this._model.update({ lastSeen }, { where: { userId } });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserDetails", method: "updateLastSeen" }) + (error as Error).message);
		}
	}

	async destroy({ filters, transaction }: { filters: { userId: string; }; transaction?: Transaction; }) {
		try {
			await this._model.destroy({ where: filters, transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "UserDetails", method: "destroy" }) + (error as Error).message);
		}
	}
}
