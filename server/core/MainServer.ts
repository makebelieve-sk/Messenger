import express, { Express } from "express";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";

import ApiServer from "./ApiServer";
import RedisWorks from "./Redis";
import PassportWorks from "./Passport";
import Database from "./Database";
import SocketWorks from "./Socket";
import { oneHour } from "../utils/datetime";
import { UsersType } from "../types";

const COOKIE_NAME = process.env.COOKIE_NAME as string;
const SECRET_KEY = process.env.SECRET_KEY as string;
const CLIENT_URL = process.env.CLIENT_URL as string;

// Класс, являющийся ядром бизнес логики приложения на стороне сервера.
export default class MainServer {
    private readonly _users: UsersType;
    private readonly _redisWork: RedisWorks;
    private readonly _database: Database;
    private readonly _passport: PassportWorks;
    private readonly _socket: SocketWorks;

    constructor(private readonly _app: Express, private readonly _server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
        this._users = new Map();

        // Инициализируем работу базы данных (модели, отношения)
        this._database = new Database();
        // Инициализируем работу Redis
        this._redisWork = new RedisWorks();
        // Инициализируем мидлвары Express
        const sessionMiddleware = this._useExpressMiddlewares();
        // Инициализируем работу Passport (мидлвары)
        this._passport = new PassportWorks(this._app, this._database, this._users);
        // Инициализируем работу API
        new ApiServer({ 
            redisWork: this._redisWork, 
            app: this._app, 
            users: this._users,
            database: this._database,
            passport: this._passport.passport
        });
        // Инициализируем работу socket.io
        this._socket = new SocketWorks(this._server, this._users, this._database, sessionMiddleware);
    }

    private _useExpressMiddlewares() {
        // Инициализируем express-сессию для пользователей с хранилищем в Redis
        const sessionMiddleware = session({
            store: this._redisWork.redisStore,  // Место хранения сессий (выбран Redis)
            name: COOKIE_NAME,                  // Наименование сессии в хранилище
            secret: SECRET_KEY,                 // Секретный ключ для шифрования данных сессии
            cookie: {
                secure: false,                  // Требует https (без него установлен в false)
                httpOnly: true,                 // Доступна только через http/https
                domain: "localhost",            // На каких доменах доступна куки с id сессии
                maxAge: undefined               // Устанавливаем время жизни сессий только до закрытия браузера. При входе перезаписываем. При переоткрытии вкладки сессия восстанавливается
            },
            resave: true,                       // Пересохранение сессии (даже если она не была изменена) при каждом запросе
            rolling: true,                      // Продлевает maxAge при каждом новом запросе
            saveUninitialized: false,           // Не помещает в store пустые сессии
            unset: "destroy"                    // Удаляем сессию из хранилища при вызове req.session.destroy()
        });

        this._app.use(cors({ 
            credentials: true,                          // Разрешает отправку и обработку cookies на клиенте
            origin: CLIENT_URL,                         // Какие домены/протоколы/порты могут отправлять запросы к серверу
            methods: ["GET", "POST", "PUT", "DELETE"],  // Какие http-методы разрешены
            maxAge: oneHour                             // Время, в течении которого браузер кеширует результаты preflight-запросов (OPTIONS)
        }));
        this._app.use(express.json());          // Для парсинга json строки
        this._app.use(cookieParser());          // Парсим cookie (позволяет получить доступ к куки через req.cookie)
        this._app.use(sessionMiddleware);
        this._app.use(express.static(path.join(__dirname, "../assets")));   // Указываем Express использовать папку assets для обслуживания статических файлов

        return sessionMiddleware;
    }

    // Закрытие сервера
    close() {
        this._database.close();
        this._redisWork.close();
        this._socket.close();
    }
};