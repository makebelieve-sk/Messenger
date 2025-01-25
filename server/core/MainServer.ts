import express, { Express } from "express";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";

import Logger from "../service/logger";
import ApiServer from "./ApiServer";
import RedisWorks from "./Redis";
import PassportWorks from "./Passport";
import Database from "./Database";
import SocketWorks from "./Socket";
import { oneHour } from "../utils/datetime";
import { ASSETS_PATH } from "../utils/files";
import { UsersType } from "../types";

const logger = Logger("MainServer");

const COOKIE_NAME = process.env.COOKIE_NAME as string;
const SECRET_KEY = process.env.SECRET_KEY as string;
const CLIENT_URL = process.env.CLIENT_URL as string;
const EXPRESS_SESSION_DOMAIN = process.env.EXPRESS_SESSION_DOMAIN as string;

// Класс, являющийся ядром бизнес логики приложения на стороне сервера.
export default class MainServer {
    private readonly _users: UsersType;
    private readonly _redisWork: RedisWorks;
    private readonly _database: Database;
    private readonly _passport: PassportWorks;
    private readonly _socket: SocketWorks;
    private _session!: express.RequestHandler;

    constructor(private readonly _app: Express, private readonly _server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
        this._users = new Map();

        logger.debug("init MainServer");

        // Инициализируем работу базы данных (модели, отношения)
        this._database = new Database();
        // Инициализируем работу Redis
        this._redisWork = new RedisWorks();
        // Инициализируем мидлвары Express
        this._useExpressMiddlewares();
        // Инициализируем работу Passport (мидлвары)
        this._passport = new PassportWorks(this._app, this._database, this._users);
        // Инициализируем работу API
        new ApiServer(
            this._redisWork, 
            this._app, 
            this._users,
            this._database,
            this._passport.passport
        );
        // Инициализируем работу socket.io
        this._socket = new SocketWorks(this._server, this._users, this._database, this._session);
    }

    private _useExpressMiddlewares() {
        // Инициализируем express-сессию для пользователей с хранилищем в Redis
        this._session = session({
            store: this._redisWork.redisStore,  // Место хранения сессий (выбран Redis)
            name: COOKIE_NAME,                  // Наименование сессии в хранилище
            secret: SECRET_KEY,                 // Секретный ключ для шифрования данных сессии
            cookie: {
                secure: false,                  // Требует https (без него установлен в false)
                httpOnly: true,                 // Доступна только через http/https
                domain: EXPRESS_SESSION_DOMAIN, // На каких доменах доступна куки с id сессии
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
        this._app.use(this._session);

        // Указываем Express использовать папку assets для обслуживания статических файлов (опции express.static необходимо прописывать каждому мидлвару в отдельности)
        this._app.use(
            express.static(
                path.join(__dirname, ASSETS_PATH),
                {
                    dotfiles: "ignore",     // Игнорируем передачу файлов, начинающихся с точки, например, .env, .gitignore и тд
                    maxAge: "1d",           // Задаем максимальное время жизни кеша со статическими файлами (то есть браузер кеширует данный файл по времени)
                    fallthrough: true,      // Запрещаем Express искать другие маршруты в случае, если файл не найден
                    cacheControl: true      // Добавляем заголовок Cache-Control в ответ для лучшего кеширования
                }
            )
        );
    }

    // Закрытие сервера
    close() {
        logger.debug("close");

        this._database.close();
        this._redisWork.close();
        this._socket.close();
    }
};