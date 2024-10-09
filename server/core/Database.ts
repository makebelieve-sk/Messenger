import { Dialect, Sequelize } from "sequelize";
import Relations from "../database/Relations";
import Models from "../database/models/Models";

const DATEBASE_NAME = process.env.DATEBASE_NAME || "Project_1";
const DATEBASE_USERNAME = process.env.DATEBASE_USERNAME || "sannikovadmin";
const DATEBASE_PASSWORD = process.env.DATEBASE_PASSWORD || "sa";
const DATEBASE_DIALECT = process.env.DATEBASE_DIALECT as Dialect || "mssql";
const DATEBASE_HOST = process.env.DATEBASE_HOST || "localhost";

const OPTIONS = {
    dialect: DATEBASE_DIALECT,
    host: DATEBASE_HOST,
    define: {
        freezeTableName: true,
        timestamps: false
    },
    logging: false
};

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
    public close() {
        this.sequelize.close()
            .then(() => console.log("Соединение с бд успешно закрыто"))
            .catch((error: string) => console.error("Соединение с бд завершилось с ошибкой: ", error));
    }

    // Соединение базы данных
    private _init() {
        this._sequelize = new Sequelize(DATEBASE_NAME, DATEBASE_USERNAME, DATEBASE_PASSWORD, OPTIONS);

        this.sequelize.authenticate()
            .then(() => {
                console.log("Соединение с базой данных успешно установлено");
                // Инициализируем модели базы данных
                this._useModels();
                // Инициализируем ассоциации (отношения) между таблицами в базе данных
                this._useRelations();
            })
            .catch(error => console.error("Ошибка при соединении с базой данных:", error));
    }

    // Инициализация ассоциаций (отношений) между таблицами в базе данных
    private _useRelations() {
        new Relations(this.models);
    }

    // Инициализация моделей базы данных
    private _useModels() {
        this._models = new Models(this.sequelize);
    }
}