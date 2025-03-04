import { Sequelize } from "sequelize";

import { DatabaseError } from "@errors/index";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import initSchema from "@migrations/04.03.2025-init-schema";

const logger = Logger("Migrations");

// Класс для управления миграциями
export default class Migrations {
    constructor(private readonly _sequelize: Sequelize) {}

    // Запуск всех миграций
    up() {
        return Promise
            .all([initSchema.up(this._sequelize)])
            .then(() => {
                logger.info(t("database.up_migrations.success"));
                return true;
            })
            .catch((error: Error) => {
                new DatabaseError(`${t("database.error.up_migrations")}: ${error.message}`);
                return false;
            });
    }

    // Откат всех миграций
    down() {
        return Promise
            .all([initSchema.down(this._sequelize)])
            .then(() => {
                logger.info(t("database.down_migrations.success"));
                return true;
            })
            .catch((error: Error) => {
                new DatabaseError(`${t("database.error.down_migrations")}: ${error.message}`);
                return false;
            });
    }
};