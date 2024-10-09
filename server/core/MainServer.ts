import express, { Express } from "express";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";

import ApiServer from "./ApiServer";
import RedisWorks from "./Redis";
import { ISocketUsers } from "../types/socket.types";
import PassportWorks from "./Passport";
import Database from "./Database";
import SocketWorks from "./Socket";

const COOKIE_NAME = process.env.COOKIE_NAME as string;
const SECRET_KEY = process.env.SECRET_KEY as string;
const CLIENT_URL = process.env.CLIENT_URL as string;

interface IContructor {
    app: Express;
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
};

export default class MainServer {
    private readonly _app: Express;
    private readonly _users: ISocketUsers;
    private readonly _redisWork: RedisWorks;
    private readonly _database: Database;
    private readonly _passport: PassportWorks;
    private readonly _socket: SocketWorks;

    constructor({ app, server }: IContructor) {
        this._app = app;
        this._users = new Map();

        // Инициализируем работу Redis
        this._redisWork = new RedisWorks();
        // Инициализируем мидлвары Express
        this._useExpressMiddlewares();
        // Инициализируем работу базы данных (модели, отношения)
        this._database = new Database();
        // Инициализируем работу Passport (мидлвары)
        this._passport = new PassportWorks({ app: this._app, database: this._database });
        // Инициализируем работу API
        new ApiServer({ 
            redisWork: this._redisWork, 
            app: this._app, 
            users: this._users,
            database: this._database,
            passport: this._passport.passport
        });
        // Инициализируем работу socket.io
        this._socket = new SocketWorks({ server, users: this._users, database: this._database });
    }

    private _useExpressMiddlewares() {
        this._app.use(cors({ credentials: true, origin: CLIENT_URL }));        // Для CORS-заголовков
        this._app.use(express.json());                                         // Для парсинга json строки
        this._app.use(cookieParser());                                         // Парсим cookie (позволяет получить доступ к куки через req.cookie)
        this._app.use(session({                                                // Инициализируем express-сессию для пользователей с хранилищем в Redis
            store: this._redisWork.redisStore,
            name: COOKIE_NAME,
            secret: SECRET_KEY,
            cookie: {
                secure: false,
                httpOnly: true,
                domain: "localhost"
            },
            resave: true,                       // Продлевает maxAge при каждом новом запросе
            rolling: true,                      // Продлевает maxAge при каждом новом запросе
            saveUninitialized: false            // Не помещает в store пустые сессии
        }));
        this._app.use(express.static(path.join(__dirname, "../assets")));          // Указываем Express использовать папку assets для обслуживания статических файлов
    }

    // Закрытие сервера
    public close() {
        this._database.close();
        this._redisWork.close();
        this._socket.close();
    }
};