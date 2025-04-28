import { Sequelize } from "sequelize";

import { t } from "@service/i18n";
import Logger from "@service/logger";
import { DatabaseError } from "@errors/index";
import initSchema from "@migrations/04.03.2025-init-schema";

const logger = Logger("Migrations");

// Класс для управления миграциями
export default class Migrations {
    constructor(private readonly _sequelize: Sequelize) {}

    // Запуск всех миграций строго по порядку
    async up() {
        // Создаем общую транзакцию на все up-миграции для того, чтобы откатить изменения в БД, при возникновении ошибки в работе любой из миграций
        const transaction = await this._sequelize.transaction();

        try {
            await initSchema.up(this._sequelize, transaction);

            await transaction.commit();

            logger.info(t("database.up_migrations.success"));

            return true;
        } catch (error) {
            await transaction.rollback();
            new DatabaseError(`${t("database.error.up_migrations")}: ${(error as Error).message}`);

            return false;
        }
    }

    // Откат всех миграций строго по порядку
    async down() {
        // Создаем общую транзакцию на все down-миграции для того, чтобы откатить изменения в БД, при возникновении ошибки в работе любой из миграций
        const transaction = await this._sequelize.transaction();

        try {
            await initSchema.down(this._sequelize, transaction);

            await transaction.commit();

            logger.info(t("database.down_migrations.success"));

            return true;
        } catch (error) {
            await transaction.rollback();
            new DatabaseError(`${t("database.error.down_migrations")}: ${(error as Error).message}`);

            return false;
        }
    }
};