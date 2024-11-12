import { Express } from "express";
import { PassportStatic } from "passport";

import { ISocketUsers } from "../types/socket.types";
import RedisWorks from "./Redis";
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

export default class ApiServer {
    private readonly _middleware: Middleware;
    private readonly _redisWork: RedisWorks;
    private readonly _app: Express;
    private readonly _users: ISocketUsers;
    private readonly _database: Database;
    private readonly _passport: PassportStatic;

    constructor({ redisWork, app, users, database, passport }: IConstructor) {
        this._redisWork = redisWork;
        this._app = app;
        this._users = users;
        this._database = database;
        this._passport = passport;

        this._middleware = new Middleware(this._redisWork);

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