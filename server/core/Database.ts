import { Dialect, Sequelize } from "sequelize";

import Relations from "../database/Relations";
import Models from "../database/models/Models";
import { DatabaseError } from "../errors";
import { t } from "../service/i18n";

const DATEBASE_NAME = process.env.DATEBASE_NAME as string;
const DATEBASE_USERNAME = process.env.DATEBASE_USERNAME as string;
const DATEBASE_PASSWORD = process.env.DATEBASE_PASSWORD as string;
const DATEBASE_DIALECT = process.env.DATEBASE_DIALECT as Dialect;
const DATEBASE_HOST = process.env.DATEBASE_HOST as string;

const OPTIONS = {
    dialect: DATEBASE_DIALECT,
    host: DATEBASE_HOST,
    define: {
        freezeTableName: true,
        timestamps: false
    },
    logging: false
};

// Класс, отвечает за работу с базой данных. Предоставляет доступ к таблицам и отношениям базы данных
export default class Database {
    private _sequelize!: Sequelize;
    private _models!: Models;

    constructor() {
        this._init();
    }

    get sequelize() {
        return this._sequelize;
    }

    get models() {
        return this._models;
    }

    // Закрытие базы данных
    close() {
        this._sequelize.close()
            .then(() => console.log(t("database.close")))
            .catch((error: Error) => new DatabaseError(`${t("database.error.close")}: ${error.message}`));
    }

    // Соединение базы данных
    private _init() {
        this._sequelize = new Sequelize(DATEBASE_NAME, DATEBASE_USERNAME, DATEBASE_PASSWORD, OPTIONS);

        this._sequelize.authenticate()
            .then(() => {
                console.log(t("database.start"));
                // Инициализируем модели базы данных
                this._useModels();
                // Инициализируем ассоциации (отношения) между таблицами в базе данных
                this._useRelations();
            })
            .catch((error: Error) => new DatabaseError(`${t("database.error.connect")}: ${error.message}`));
    }

    // Инициализация ассоциаций (отношений) между таблицами в базе данных
    private _useRelations() {
        new Relations(this._models);
    }

    // Инициализация моделей базы данных
    private _useModels() {
        this._models = new Models(this._sequelize);
    }
}