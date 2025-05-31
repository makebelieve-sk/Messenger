import type { Express } from "express";
import type { PassportStatic } from "passport";

import AuthController from "@core/api/controllers/Auth";
import ImagesController from "@core/api/controllers/Images";
import MainController from "@core/api/controllers/Main";
// import FilesController from "@core/api/controllers/Files";
// import FriendsController from "@core/api/controllers/Friends";
// import MessagesController from "@core/api/controllers/Messages";
import UserController from "@core/api/controllers/User";
import Middleware from "@core/api/Middleware";
import swaggerWork from "@core/api/swagger/Swagger";
import UsersController from "@core/controllers/UsersController";
import Database from "@core/database/Database";
import RedisWorks from "@core/Redis";
import Logger from "@service/logger";

const logger = Logger("ApiServer");

// Класс, отвечает за обработку HTTP-запросов от клиента
export default class ApiServer {
	private readonly _middleware: Middleware;

	constructor(
		private readonly _redisWork: RedisWorks,
		private readonly _app: Express,
		private readonly _users: UsersController,
		private readonly _database: Database,
		private readonly _passport: PassportStatic,
		private readonly _swagger: swaggerWork,
	) {
		this._middleware = new Middleware(this._redisWork, this._app);


		this._init();
	}

	// Запуск контроллеров обработки API запросов
	private _init() {
		logger.debug("init");

		// Общий мидлвар, добавляет ограничение на количество запросов для пользователя на всё API
		this._middleware.rateLimiter();

		new AuthController(this._app, this._middleware, this._database, this._redisWork, this._passport, this._users);
		// Обязательно объявляем MainController позже AuthController, чтобы был доступен нормально статичный метод logout
		new MainController(this._app, this._middleware, this._database, this._swagger);
		new ImagesController(this._app, this._middleware, this._database);
		// new FilesController(this._app, this._middleware, this._database);
		// new FriendsController(this._app, this._middleware, this._database, this._users);
		// new MessagesController(this._app, this._middleware, this._database);
		new UserController(this._app, this._middleware, this._database);

		// Общий мидлвар, ловит все ошибки, которые были вызваны в любом контроллере с помощью next(error)
		this._middleware.catch();
	}
}
