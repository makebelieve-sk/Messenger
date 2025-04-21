import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import session from "express-session";
import path from "path";

import corsConfig from "@config/cors.config";
import expressSessionConfig from "@config/express-session.config";
import expressStaticConfig from "@config/express-static.config";
import ApiServer from "@core/api/ApiServer";
import UsersController from "@core/controllers/UsersController";
import Database from "@core/database/Database";
import PassportWorks from "@core/Passport";
import RedisWorks from "@core/Redis";
import SocketWorks from "@core/socket/Socket";
import Logger from "@service/logger";
import { ServerType } from "@custom-types/index";
import { ASSETS_DIR } from "@utils/constants";

const logger = Logger("MainServer");

// Класс, являющийся ядром бизнес логики приложения на стороне сервера.
export default class MainServer {
	private readonly _users: UsersController;
	private readonly _redisWork: RedisWorks;
	private readonly _database: Database;
	private readonly _passport: PassportWorks;
	private readonly _socket: SocketWorks;
	private _session!: express.RequestHandler;

	constructor(
		private readonly _app: Express,
		private readonly _server: ServerType,
	) {
		logger.debug("init");

		// Инициализация контроллера управления пользователями на сервере
		this._users = new UsersController();
		// Инициализируем работу базы данных (модели, отношения)
		this._database = new Database();
		// Инициализируем работу Redis
		this._redisWork = new RedisWorks();
		// Инициализируем мидлвары Express
		this._useExpressMiddlewares();
		// Инициализируем работу Passport (мидлвары)
		this._passport = new PassportWorks(this._app, this._database, this._users);
		// Инициализируем работу API
		new ApiServer(this._redisWork, this._app, this._users, this._database, this._passport.passport);
		// Инициализируем работу socket.io
		this._socket = new SocketWorks(this._server, this._users, this._database, this._redisWork, this._session);
	}

	private _useExpressMiddlewares() {
		// Инициализируем express-сессию для пользователей с хранилищем в Redis
		this._session = session(expressSessionConfig(this._redisWork.redisStore));

		this._app.use(cors(corsConfig)); // Инициализируем политику CORS
		this._app.use(express.json()); // Для парсинга json строки
		this._app.use(cookieParser()); // Парсим cookie (позволяет получить доступ к куки через req.cookie)
		this._app.use(this._session); // Используем конфигурацию сессии express-session

		/**
		 * Указываем Express использовать папку assets для обслуживания статических файлов
		 * (опции express.static необходимо прописывать каждому мидлвару в отдельности).
		 */
		this._app.use(express.static(path.join(__dirname, "../", ASSETS_DIR), expressStaticConfig));
	}

	// Закрытие сервера
	async close() {
		logger.debug("close");

		await this._database.close();
		await this._redisWork.close();
		await this._socket.close();
	}
}
