import { Express } from "express";
import { PassportStatic } from "passport";

import AuthController from "@core/api/controllers/Auth";
import FilesController from "@core/api/controllers/Files";
import FriendsController from "@core/api/controllers/Friends";
import ImagesController from "@core/api/controllers/Images";
import MessagesController from "@core/api/controllers/Messages";
import UserController from "@core/api/controllers/User";
import Database from "@core/Database";
import Middleware from "@core/Middleware";
import RedisWorks from "@core/Redis";
import Logger from "@service/logger";
import { UsersType } from "@custom-types/index";

const logger = Logger("ApiServer");

// Класс, отвечает за обработку HTTP-запросов от клиента
export default class ApiServer {
    private readonly _middleware: Middleware;

    constructor(
        private readonly _redisWork: RedisWorks,
        private readonly _app: Express,
        private readonly _users: UsersType,
        private readonly _database: Database,
        private readonly _passport: PassportStatic
    ) {
        this._middleware = new Middleware(this._redisWork, this._app);

        this._init();
    }

    // Запуск контроллеров обработки API запросов
    private _init() {
        logger.debug("init");

        new AuthController(this._app, this._middleware, this._database, this._redisWork, this._passport, this._users);
        new ImagesController(this._app, this._middleware, this._database);
        new FilesController(this._app, this._middleware, this._database);
        new FriendsController(this._app, this._middleware, this._database, this._users);
        new MessagesController(this._app, this._middleware, this._database);
        new UserController(this._app, this._middleware, this._database);

        // Общий мидлвар, ловит все ошибки, которые были вызваны в любом контроллере с помощью next(error)
        this._middleware.catch();
    }
};