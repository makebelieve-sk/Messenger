import { Dialect, Sequelize } from "sequelize";

import Relations from "@database/Relations";
import Models from "@database/models/Models";
import { DatabaseError } from "@errors/index";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import Migrations from "@database/Migrations";

const logger = Logger("Database");

const DATEBASE_DOWN_MIGRATIONS = JSON.parse(process.env.DATEBASE_DOWN_MIGRATIONS as string);
const DATEBASE_NAME = process.env.DATEBASE_NAME as string;
const DATEBASE_USERNAME = process.env.DATEBASE_USERNAME as string;
const DATEBASE_PASSWORD = process.env.DATEBASE_PASSWORD as string;
const DATEBASE_DIALECT = process.env.DATEBASE_DIALECT as Dialect;
const DATEBASE_HOST = process.env.DATEBASE_HOST as string;
const DATEBASE_PORT = parseInt(process.env.DATEBASE_PORT as string);

// Класс, отвечает за работу с базой данных. Предоставляет доступ к таблицам и отношениям базы данных
export default class Database {
    private _sequelize!: Sequelize;
    private _models!: Models;
    private _migrations!: Migrations;

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
        logger.debug("close");

        this._sequelize.close()
            .then(() => logger.info(t("database.close")))
            .catch((error: Error) => new DatabaseError(`${t("database.error.close")}: ${error.message}`));
    }

    // Соединение базы данных
    private _init() {
        logger.debug("init");

        this._sequelize = new Sequelize(
            DATEBASE_NAME,                  // Наименование базы данных
            DATEBASE_USERNAME,              // Имя пользователя для подключения к базе данных
            DATEBASE_PASSWORD,              // Пароль пользователя для подключения к базе данных
            {
                dialect: DATEBASE_DIALECT,  // Тип базы данных (mysql/sqlite/postgres/mssql)
                host: DATEBASE_HOST,        // Адрес сервера базы данных
                port: DATEBASE_PORT,        // Порт для подключения к базе данных
                define: {
                    freezeTableName: true,  // Отключение автоматических имен таблиц
                    timestamps: false,      // Включает создание createdAt и updatedAt поля в таблицах
                    paranoid: false         // Отключает мягкое удаление (записи удаляются из таблиц, поля deletedAt нет)
                },                          // Глобальные настройки для всех моделей
                logging: false,             // Логирование sql запросов (false/console.log)
                benchmark: false            // Время выполнения запроса в логах
            }
        );

        this._sequelize.authenticate()
            .then(() => {
                logger.info(t("database.start"));

                // Запускаем все миграции
                this._runMigrations();
            })
            .catch((error: Error) => new DatabaseError(`${t("database.error.connect")}: ${error.message}`));
    }

    // Запуск всех миграций для синхронизации базы данных
    private async _runMigrations() {
        try {
            this._migrations = new Migrations(this._sequelize);

            // Запуск откатов миграций при установке env переменной
            if (DATEBASE_DOWN_MIGRATIONS) {
                const isSuccess = await this._migrations.down();
                
                if (!isSuccess) {
                    this.close();
                    return;
                }
            }

            const isSuccess = await this._migrations.up();

            if (isSuccess) {
                // Инициализируем модели базы данных
                this._useModels();
                // Инициализируем ассоциации (отношения) между таблицами в базе данных
                this._useRelations();
            } else {
                this.close();
            }
        } catch (error) {
            new DatabaseError(`${t("database.error.migrations")}: ${(error as Error).message}`)
        }
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