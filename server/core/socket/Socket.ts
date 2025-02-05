import { RequestHandler } from "express";
import { Server } from "socket.io";
import EventEmitter from "events";

import Database from "../Database";
import SocketController from "./SocketController";
import Logger from "../../service/logger";
import { t } from "../../service/i18n";
import { ISocketUser, SocketType, SocketWithUser } from "../../types/socket.types";
import { ServerType, UsersType } from "../../types";
import { SocketError } from "../../errors";

const logger = Logger("Socket");

const CLIENT_URL = process.env.CLIENT_URL as string;
const SOCKET_METHOD = process.env.SOCKET_METHOD as string;
const SOCKET_PING_INTARVAL = parseInt(process.env.SOCKET_PING_INTARVAL as string);
const SOCKET_PING_TIMEOUT = parseInt(process.env.SOCKET_PING_TIMEOUT as string);
const SOCKET_UPGRADE_TIMEOUT = parseInt(process.env.SOCKET_UPGRADE_TIMEOUT as string);
const SOCKET_MAX_DISCONNECTION_DURATION = parseInt(process.env.SOCKET_MAX_DISCONNECTION_DURATION as string);

// Класс, отвечает за установку сокет соединения с клиентом по транспорту websocket
export default class SocketWorks extends EventEmitter {
    private _io!: SocketType;

    constructor(
        private readonly _server: ServerType, 
        private readonly _users: UsersType, 
        private readonly _database: Database,
        private readonly _expressSession: RequestHandler
    ) {
        super();

        this._init();
    }

    get io() {
        return this._io;
    }

    private _init() {
        logger.debug("init");

        this._io = new Server(this._server, {
            transports: ["websocket"],      // Транспорт для соединений
            cors: {
                origin: CLIENT_URL,         // Список разрешенных доменов
                methods: [SOCKET_METHOD],   // Список разрешенных методов запроса (разрешен только самый первый запрос для установки соединения между сервером и клиентом)
                credentials: true           // Разрешает отправку cookie и других авторизационных данных
            },
            pingInterval: SOCKET_PING_INTARVAL,      // Указываем с какой частотой идет heartbeat на клиент
            pingTimeout: SOCKET_PING_TIMEOUT,        // Указываем сколько может ожидать ответ от клиента сервер перед тем, как посчитает соединение закрытым (если клиент все равно не ответит)
            upgradeTimeout: SOCKET_UPGRADE_TIMEOUT,  // Время, которое будет ожидать сервер до обновления 1-ого запроса (handshake) до указанного транспорта websocket
            connectionStateRecovery: {
                maxDisconnectionDuration: SOCKET_MAX_DISCONNECTION_DURATION, // Указывает время, в течении которого клиент может переподключиться 
                skipMiddlewares: false          // При разрыве соединении пропускаем мидлвары socket.io
            }                                   // Опция для восстановления соединения клиента из-за временного разрыва (например, спящий режим или потеря сети)
        });

        this._useMiddlewares();
        this._onConnection();
        this._useEngineHandlers();
    }

    private _useMiddlewares() {
        // Милдвар сокета - добавление сессии express-session в соединение socket.io
        this.io.engine.use(this._expressSession);

        // Милдвар сокета - проверка пользователя в сокете
        this.io.use((socket, next) => {
            const user: ISocketUser = socket.handshake.auth.user;
    
            if (!user) {
                return next(new SocketError(t("socket.error.user_id_not_found")));
            }

            // Обновляем объект подключившегося пользователя
            this._users.set(user.id, {
                ...user,
                socketId: socket.id
            });
    
            (socket as SocketWithUser).user = user;
            next();
        });
    }

    private _onConnection() {
        this._io.on("connection", socket => {
            new SocketController(this._users, this._database, socket as SocketWithUser);
        });
    }

    private _useEngineHandlers() {
        logger.debug("_useEngineHandlers");

        // Не нормальное отключение io
        this._io.engine.on("connection_error", (error: { req: string; code: number; message: string; context: string; }) => {
            const { req, code, message, context } = error;
            new SocketError(t("socket.error.engine_socket", { req, code: code.toString(), message, context }));
        });
    }

    close() {
        logger.debug("close");

        this._io.close();
    }
}