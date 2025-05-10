import { type Error, Sequelize } from "sequelize";

import mssqlConfig from "@config/mssql.config";
import Migrations from "@core/database/Migrations";
import Relations from "@core/database/Relations";
import Repository from "@core/database/Repository";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import SequelizeError from "@errors/sequelize";
import { DATEBASE_DOWN_MIGRATIONS } from "@utils/constants";

const logger = Logger("Database");

// Класс, отвечает за работу с базой данных. Предоставляет доступ к репозиториям и отношениям базы данных
export default class Database {
	private _sequelize!: Sequelize;
	private _repo!: Repository;
	private _migrations!: Migrations;

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
			logger.info(t("database.close"));
		} catch (error) {
			new SequelizeError(error as Error, t("database.error.close"));
		};
	}

	// Соединение базы данных
	private _init() {
		logger.debug("init");

		this._sequelize = new Sequelize(mssqlConfig);

		this._sequelize
			.authenticate()
			.then(() => {
				logger.info(t("database.start"));

				// Запускаем все миграции
				this._runMigrations();
			})
			.catch((error: Error) => new SequelizeError(error, t("database.error.connect")));
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
				this._useRepositories();
				// Инициализируем ассоциации (отношения) между таблицами в базе данных
				this._useRelations();
			} else {
				this.close();
			}
		} catch (error) {
			new SequelizeError(error as Error, t("database.error.migrations"));
		}
	}

	// Инициализация репозиториев базы данных
	private _useRepositories() {
		this._repo = new Repository(this._sequelize);
	}

	// Инициализация ассоциаций (отношений) между таблицами в базе данных
	private _useRelations() {
		new Relations(this._repo);
	}
}
