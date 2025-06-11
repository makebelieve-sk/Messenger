import type { Error, Sequelize } from "sequelize";

import { t } from "@service/i18n";
import Logger from "@service/logger";
import SequelizeError from "@errors/sequelize";
import initSchema from "@migrations/04.03.2025-init-schema";
import addIsDeletedToUsers from "@migrations/05.05.2025-add-is-deleted-to-users";
import changeIndexesInUsers from "@migrations/07.05.2025-change-indexes-in-users";
import deleteFriendActions from "@migrations/26.05.2025-delete-friend-actions";

const logger = Logger("Migrations");

// Класс для управления миграциями
export default class Migrations {
	constructor(private readonly _sequelize: Sequelize) {}

	// Запуск всех миграций строго по порядку
	async up() {
		/**
		 * Создаем общую транзакцию на все up-миграции для того, чтобы откатить изменения в БД
		 * при возникновении ошибки в работе любой из миграций.
		 */
		const transaction = await this._sequelize.transaction();

		try {
			await initSchema.up(this._sequelize, transaction);
			await addIsDeletedToUsers.up(this._sequelize, transaction);
			await changeIndexesInUsers.up(this._sequelize, transaction);
			await deleteFriendActions.up(this._sequelize, transaction);

			await transaction.commit();

			logger.info(t("database.up_migrations.success"));

			return true;
		} catch (error) {
			await transaction.rollback();
			new SequelizeError(error as Error, t("database.error.up_migrations"));

			return false;
		}
	}

	// Откат всех миграций строго по порядку
	async down() {
		/**
		 * Создаем общую транзакцию на все down-миграции для того, чтобы откатить изменения в БД
		 * при возникновении ошибки в работе любой из миграций.
		 */
		const transaction = await this._sequelize.transaction();

		try {
			await initSchema.down(this._sequelize, transaction);
			await changeIndexesInUsers.down(this._sequelize, transaction);
			await addIsDeletedToUsers.down(this._sequelize, transaction);
			await deleteFriendActions.down(this._sequelize, transaction);

			await transaction.commit();

			logger.info(t("database.down_migrations.success"));

			return true;
		} catch (error) {
			await transaction.rollback();
			new SequelizeError(error as Error, t("database.error.down_migrations"));

			return false;
		}
	}
}
