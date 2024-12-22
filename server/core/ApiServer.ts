import EventEmitter from "events";
import { Express, Response } from "express";
import { PassportStatic } from "passport";

import RedisWorks from "./Redis";
import Middleware from "./Middleware";
import Database from "./Database";
import AuthController from "../controllers/Auth";
import FileController from "../controllers/File";
import FriendsController from "../controllers/Friends";
import MessagesController from "../controllers/Messages";
import UserController from "../controllers/User";
import { UsersType } from "../types";
import { ApiServerEvents } from "../types/events";
import { AuthError, FileError, FriendsError, MessagesError, UsersError } from "../errors/controllers";
import { MiddlewareError } from "../errors";

interface IConstructor { 
    redisWork: RedisWorks; 
    app: Express; 
    users: UsersType; 
    database: Database;
    passport: PassportStatic;
};

type ListenerType<E> = { error: Error | E; res: Response };

export default class ApiServer extends EventEmitter {
    private readonly _middleware: Middleware;
    private readonly _redisWork: RedisWorks;
    private readonly _app: Express;
    private readonly _users: UsersType;
    private readonly _database: Database;
    private readonly _passport: PassportStatic;

    private _authController!: AuthController;
    private _fileController!: FileController;
    private _friendsController!: FriendsController;
    private _messagesController!: MessagesController;
    private _userController!: UserController;

    constructor({ redisWork, app, users, database, passport }: IConstructor) {
        super();

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
        this._authController = new AuthController({ app: this._app, database: this._database, middleware: this._middleware, redisWork: this._redisWork, passport: this._passport, users: this._users });
        this._fileController = new FileController({ app: this._app, database: this._database, middleware: this._middleware });
        this._friendsController = new FriendsController({ app: this._app, database: this._database, middleware: this._middleware, users: this._users });
        this._messagesController = new MessagesController({ app: this._app, database: this._database, middleware: this._middleware });
        this._userController = new UserController({ app: this._app, database: this._database, middleware: this._middleware });

        this._bindListeners();
    }

    // Подключаем слушатели дочерних контроллеров API
    private _bindListeners() {
        this._bindMiddlewareListeners();

        this._bindAuthListeners();
        this._bindFileListeners();
        this._bindFriendsListeners();
        this._bindMessagesListeners();
        this._bindUserListeners();
    }

    private _bindMiddlewareListeners() {
        this._middleware.on(ApiServerEvents.ERROR, ({ error, res }: ListenerType<MiddlewareError>) => {
            const nextError = error instanceof MiddlewareError
                ? error
                : new MiddlewareError(error.message);

            res.status(nextError.status).send({ success: false, message: nextError.message });
        });
    }

    private _bindAuthListeners() {
        this._authController.on(ApiServerEvents.ERROR, ({ error, res }: ListenerType<AuthError>) => {
            const nextError = error instanceof AuthError
                ? error
                : new AuthError((error as Error).message);
            let errorMessage = {
                success: false, 
                message: nextError.message
            };

            // При необходимости дополняем возвращаемый объект ошибки (например, при входе)
            if (nextError.options) {
                errorMessage = {
                    ...errorMessage,
                    ...nextError.options
                }
            }

            res.status(nextError.status).send(errorMessage);
        });
    }

    private _bindFileListeners() {
        this._fileController.on(ApiServerEvents.ERROR, ({ error, res }: ListenerType<FileError>) => {
            const nextError = error instanceof FileError
                ? error
                : new FileError(error.message);

            res.status(nextError.status).send({ success: false, message: nextError.message });
        });
    }

    private _bindFriendsListeners() {
        this._friendsController.on(ApiServerEvents.ERROR, ({ error, res }: ListenerType<FriendsError>) => {
            const nextError = error instanceof FriendsError
                ? error
                : new FriendsError(error.message);

            res.status(nextError.status).send({ success: false, message: nextError.message });
        });
    }

    private _bindMessagesListeners() {
        this._messagesController.on(ApiServerEvents.ERROR, ({ error, res }: ListenerType<MessagesError>) => {
            const nextError = error instanceof MessagesError
                ? error
                : new MessagesError(error.message);

            res.status(nextError.status).send({ success: false, message: nextError.message });
        });
    }

    private _bindUserListeners() {
        this._userController.on(ApiServerEvents.ERROR, ({ error, res }: ListenerType<UsersError>) => {
            const nextError = error instanceof UsersError
                ? error
                : new UsersError(error.message);

            res.status(nextError.status).send({ success: false, message: nextError.message });
        });
    }
};