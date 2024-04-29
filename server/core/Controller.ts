import { Express } from "express";
import { PassportStatic } from "passport";

import RedisWorks from "./Redis";
import { ISocketUsers } from "../types/socket.types";
import Middleware from "./Middleware";
import Database from "./Database";
import AuthController from "../controllers/Auth";
import FileController from "../controllers/File";
import FriendsController from "../controllers/Friends";
import MessagesController from "../controllers/Messages";
import UserController from "../controllers/User";

interface IConstructor { 
    redisWork: RedisWorks; 
    app: Express; 
    users: ISocketUsers; 
    database: Database;
    passport: PassportStatic;
};

export default class Controller {
    private _middleware: Middleware;
    private _redisWork: RedisWorks;
    private _app: Express;
    private _users: ISocketUsers;
    private _database: Database;
    private _passport: PassportStatic;

    constructor({ redisWork, app, users, database, passport }: IConstructor) {
        this._redisWork = redisWork;
        this._app = app;
        this._users = users;
        this._database = database;
        this._passport = passport;

        this._middleware = new Middleware({ redisWork: this._redisWork });

        this._init();
    }

    // Запуск контроллеров обработки API запросов
    private _init() {
        new AuthController({ app: this._app, database: this._database, middleware: this._middleware, redisWork: this._redisWork, passport: this._passport });
        new FileController({ app: this._app, database: this._database, middleware: this._middleware });
        new FriendsController({ app: this._app, database: this._database, middleware: this._middleware, users: this._users });
        new MessagesController({ app: this._app, database: this._database, middleware: this._middleware });
        new UserController({ app: this._app, database: this._database, middleware: this._middleware });
    }
};