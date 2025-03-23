import { RequestHandler } from "express";
import { ExtendedError, Server } from "socket.io";
import EventEmitter from "events";
import { IncomingMessage } from "http";

import Database from "@core/Database";
import RedisWorks from "@core/Redis";
import SocketController from "@core/socket/SocketController";
import Logger from "@service/logger";
import { t } from "@service/i18n";
import { SocketType, SocketWithUser } from "@custom-types/socket.types";
import { ServerType, UsersType } from "@custom-types/index";
import { RedisKeys } from "@custom-types/enums";
import { SocketError } from "@errors/index";

declare module "http" {
    interface IncomingMessage {
        sessionID: string; // Здесь мы добавляем свойство sessionID
    }
}

const logger = Logger("Socket");
const COOKIE_HEADER_NAME = "Set-Cookie";

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
        private readonly _redisWork: RedisWorks,
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
                skipMiddlewares: false      // При разрыве соединении пропускаем мидлвары socket.io
            }                               // Опция для восстановления соединения клиента из-за временного разрыва (например, спящий режим или потеря сети)
        });

        this._useMiddlewares();
        this._onConnection();
        this._useEngineHandlers();
    }

    private _useMiddlewares() {
        // Милдвар сокета - добавление сессии express-session в соединение socket.io
        this._io.engine.use(this._expressSession);

        // Мидлвар сокета - проверка сессии запроса сокет-соединения в Redis
        this._io.use(async (socket, next) => {
            const isRedisSessionExists = await this._checkRedisSession(socket.request.sessionID);

            if (!isRedisSessionExists) {
                return this._handleMiddlewareError("socket.error.sessions_not_match_or_exists", next);
            }

            logger.info(t("socket.session_done"));
            next();
        });

        // Милдвар сокета - проверка пользователя в сокете
        this._io.use((socket, next) => {
            const userId: string | undefined = socket.handshake.auth.userId;

            if (!userId) {
                return this._handleMiddlewareError("socket.error.user_id_not_found", next);
            }

            const findUser = this._users.get(userId);

            if (!findUser) {
                return this._handleMiddlewareError("socket.error.user_not_found", next);
            }

            (socket as SocketWithUser).user = findUser;
            next();
        });
    }

    private _onConnection() {
        this._io.on("connection", socket => {
            new SocketController(this._users, this._database, socket as SocketWithUser, this._io);
        });
    }

    private _useEngineHandlers() {
        logger.debug("_useEngineHandlers");

        /**
         * Проверка первичного handshake запроса перед установкой сокет-соединения
         * Проверка происходит в 3 этапа:
         *   - проверка сессии в заголовках запроса
         *   - проверка сессии в объекте запроса
         *   - проверка сессии в Redis хранилище (RedisStore)
         */
        this._io.engine.on("initial_headers", async (headers: Record<string, string>, req: IncomingMessage) => {
            // Удостоверимся, что заголовки содержат заголовок с куки
            if (headers.hasOwnProperty(COOKIE_HEADER_NAME) && headers[COOKIE_HEADER_NAME][0]) {
                const sessionHeader = headers[COOKIE_HEADER_NAME][0];

                // Удостоверимся, что куки с id сессии в заголовках совпадает с id сессии в объекте запроса
                if (sessionHeader.includes(req.sessionID)) {
                    const isRedisSessionExists = await this._checkRedisSession(req.sessionID);

                    if (isRedisSessionExists) {
                        logger.info(t("socket.handshake_connection_successful"));
                        return;
                    }
                }
            }

            new SocketError(t("socket.error.sessions_not_match_or_exists", { sessionId: req.sessionID }));
        });

        // Не нормальное отключение io
        this._io.engine.on("connection_error", (error: { _: IncomingMessage; code: number; message: string; context: { name: string; }; }) => {
            const { code, message, context } = error;
            new SocketError(t("socket.error.engine_socket", { code: code.toString(), message, context: context.name }));
        });
    }

    // Проверка сессии в RedisStore
    private async _checkRedisSession(sessionId: string) {
        return Boolean(await this._redisWork.get(RedisKeys.SESS, sessionId));
    }

    // Обработчик ошибок в мидлваре сокет соединения (вывод ошибки в консоль, в логгер и возврат в "connect_error" на клиенте)
    private _handleMiddlewareError(text: string, next: (err?: ExtendedError) => void) {
        const socketError = new SocketError(t(text));
        return next(socketError.setMiddlewareError());
    }

    close() {
        logger.debug("close");

        // Берем все сокеты главного неймспейса и возвращаем их
        const sockets = Array.from(this._io.sockets.sockets.values());

        for (let i = 0; i < sockets.length; i++) {
            const socket = sockets[i];

            // Получаем список всех событий для каждого сокета
            const socketEvents = socket.eventNames();

            for (let j = 0; j < socketEvents.length; j++) {
                // Удаляем все слушатели каждого события сокета для предотвращения утечки памяти
                socket.removeAllListeners(socketEvents[j]);
            }
        }

        this._io.close();
    }
}