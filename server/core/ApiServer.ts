import { Express } from "express";
import { PassportStatic } from "passport";

import Logger from "../service/logger";
import RedisWorks from "./Redis";
import Middleware from "./Middleware";
import Database from "./Database";
import AuthController from "../controllers/Auth";
import ImagesController from "../controllers/Images";
import FilesController from "../controllers/Files";
import FriendsController from "../controllers/Friends";
import MessagesController from "../controllers/Messages";
import UserController from "../controllers/User";
import { UsersType } from "../types";

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