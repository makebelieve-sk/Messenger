"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const mssql_config_1 = __importDefault(require("@config/mssql.config"));
const Migrations_1 = __importDefault(require("@core/database/Migrations"));
const Relations_1 = __importDefault(require("@core/database/Relations"));
const Repository_1 = __importDefault(require("@core/database/Repository"));
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const sequelize_2 = __importDefault(require("@errors/sequelize"));
const constants_1 = require("@utils/constants");
const logger = (0, logger_1.default)("Database");
// Класс, отвечает за работу с базой данных. Предоставляет доступ к репозиториям и отношениям базы данных
class Database {
    constructor() {
        this._init();
    }
    get sequelize() {
        return this._sequelize;
    }
    get repo() {
        return this._repo;
    }
    // Закрытие базы данных
    async close() {
        try {
            logger.debug("close");
            await this._sequelize.close();
            logger.info((0, i18n_1.t)("database.close"));
        }
        catch (error) {
            new sequelize_2.default(error, (0, i18n_1.t)("database.error.close"));
        }
        ;
    }
    // Соединение базы данных
    _init() {
        logger.debug("init");
        this._sequelize = new sequelize_1.Sequelize(mssql_config_1.default);
        this._sequelize
            .authenticate()
            .then(() => {
            logger.info((0, i18n_1.t)("database.start"));
            // Запускаем все миграции
            this._runMigrations();
        })
            .catch((error) => new sequelize_2.default(error, (0, i18n_1.t)("database.error.connect")));
    }
    // Запуск всех миграций для синхронизации базы данных
    async _runMigrations() {
        try {
            this._migrations = new Migrations_1.default(this._sequelize);
            // Запуск откатов миграций при установке env переменной
            if (constants_1.DATEBASE_DOWN_MIGRATIONS) {
                const isSuccess = await this._migrations.down();
                if (!isSuccess) {
                    this.close();
                    return;
                }
            }
            const isSuccess = await this._migrations.up();
            if (isSuccess) {
                // Инициализируем модели базы данных
                this._useRepositories();
                // Инициализируем ассоциации (отношения) между таблицами в базе данных
                this._useRelations();
            }
            else {
                this.close();
            }
        }
        catch (error) {
            new sequelize_2.default(error, (0, i18n_1.t)("database.error.migrations"));
        }
    }
    // Инициализация репозиториев базы данных
    _useRepositories() {
        this._repo = new Repository_1.default(this._sequelize);
    }
    // Инициализация ассоциаций (отношений) между таблицами в базе данных
    _useRelations() {
        new Relations_1.default(this._repo);
    }
}
exports.default = Database;
//# sourceMappingURL=Database.js.map