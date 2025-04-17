import type { Sequelize, Transaction } from "sequelize";

import createNotificationSettings, { NotificationSettings } from "@core/database/models/notification-settings";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";

const DEFAULT_CREATION_ATTRIBUTES = {
	soundEnabled: 1,
	messageSound: 1,
	friendRequestSound: 1,
};

// Репозиторий, который содержит методы по работе с моделью NotificationSettings
export default class NotificationsSettings {
	private _model: typeof NotificationSettings;

	constructor(private readonly _sequelize: Sequelize) {
		this._model = createNotificationSettings(this._sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ userId, transaction }: { userId: string; transaction?: Transaction; }) {
		try {
			const newNotificationSettings = await this._model.create({ ...DEFAULT_CREATION_ATTRIBUTES, userId }, { transaction });

			return newNotificationSettings.getEntity();
		} catch (error) {
			throw new RepositoryError(
				t("repository.error.internal_db", {
					repo: "NotificationsSettings",
					method: "create",
				}) + (error as Error).message,
			);
		}
	}

	async findOneBy({ filters, transaction }: { filters: { userId: string; }; transaction?: Transaction; }) {
		try {
			return await this._model.findOne({ where: filters, transaction });
		} catch (error) {
			throw new RepositoryError(
				t("repository.error.internal_db", {
					repo: "NotificationsSettings",
					method: "findOneBy",
				}) + (error as Error).message,
			);
		}
	}
}
