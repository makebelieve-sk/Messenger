"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const sequelize_1 = __importDefault(require("@errors/sequelize"));
const _04_03_2025_init_schema_1 = __importDefault(require("@migrations/04.03.2025-init-schema"));
const _05_05_2025_add_is_deleted_to_users_1 = __importDefault(require("@migrations/05.05.2025-add-is-deleted-to-users"));
const _07_05_2025_change_indexes_in_users_1 = __importDefault(require("@migrations/07.05.2025-change-indexes-in-users"));
const _26_05_2025_delete_friend_actions_1 = __importDefault(require("@migrations/26.05.2025-delete-friend-actions"));
const logger = (0, logger_1.default)("Migrations");
// Класс для управления миграциями
class Migrations {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
    }
    // Запуск всех миграций строго по порядку
    async up() {
        /**
         * Создаем общую транзакцию на все up-миграции для того, чтобы откатить изменения в БД
         * при возникновении ошибки в работе любой из миграций.
         */
        const transaction = await this._sequelize.transaction();
        try {
            await _04_03_2025_init_schema_1.default.up(this._sequelize, transaction);
            await _05_05_2025_add_is_deleted_to_users_1.default.up(this._sequelize, transaction);
            await _07_05_2025_change_indexes_in_users_1.default.up(this._sequelize, transaction);
            await _26_05_2025_delete_friend_actions_1.default.up(this._sequelize, transaction);
            await transaction.commit();
            logger.info((0, i18n_1.t)("database.up_migrations.success"));
            return true;
        }
        catch (error) {
            await transaction.rollback();
            new sequelize_1.default(error, (0, i18n_1.t)("database.error.up_migrations"));
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
            await _04_03_2025_init_schema_1.default.down(this._sequelize, transaction);
            await _07_05_2025_change_indexes_in_users_1.default.down(this._sequelize, transaction);
            await _05_05_2025_add_is_deleted_to_users_1.default.down(this._sequelize, transaction);
            await _26_05_2025_delete_friend_actions_1.default.down(this._sequelize, transaction);
            await transaction.commit();
            logger.info((0, i18n_1.t)("database.down_migrations.success"));
            return true;
        }
        catch (error) {
            await transaction.rollback();
            new sequelize_1.default(error, (0, i18n_1.t)("database.error.down_migrations"));
            return false;
        }
    }
}
exports.default = Migrations;
//# sourceMappingURL=Migrations.js.map