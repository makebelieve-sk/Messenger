"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const socket_io_1 = require("socket.io");
const socket_io_config_1 = __importDefault(require("@config/socket.io.config"));
const SocketController_1 = __importDefault(require("@core/socket/SocketController"));
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const index_1 = require("@errors/index");
const enums_1 = require("@custom-types/enums");
const logger = (0, logger_1.default)("Socket");
const COOKIE_HEADER_NAME = "Set-Cookie";
// Класс, отвечает за установку сокет соединения с клиентом по транспорту "websocket"
class SocketWorks extends events_1.default {
    constructor(_server, _users, _database, _redisWork, _expressSession) {
        super();
        this._server = _server;
        this._users = _users;
        this._database = _database;
        this._redisWork = _redisWork;
        this._expressSession = _expressSession;
        this._init();
    }
    get io() {
        return this._io;
    }
    _init() {
        logger.debug("init");
        this._io = new socket_io_1.Server(this._server, socket_io_config_1.default);
        this._useMiddlewares();
        this._onConnection();
        this._useEngineHandlers();
    }
    _useMiddlewares() {
        // Милдвар сокета - добавление сессии express-session в соединение socket.io
        this._io.engine.use(this._expressSession);
        // Мидлвар сокета - проверка сессии запроса сокет-соединения в Redis
        this._io.use(async (socket, next) => {
            const isRedisSessionExists = await this._checkRedisSession(socket.request.sessionID);
            if (!isRedisSessionExists) {
                return this._handleMiddlewareError("socket.error.sessions_not_match_or_exists", next);
            }
            logger.info((0, i18n_1.t)("socket.session_done"));
            next();
        });
        // Милдвар сокета - проверка пользователя в сокете
        this._io.use((socket, next) => {
            const userId = socket.handshake.auth.userId;
            if (!userId) {
                return this._handleMiddlewareError("socket.error.user_id_not_found", next);
            }
            const findUser = this._users.get(userId);
            if (!findUser) {
                return this._handleMiddlewareError("socket.error.user_not_found", next);
            }
            socket.user = findUser;
            next();
        });
    }
    _onConnection() {
        this._io.on("connection", socket => {
            new SocketController_1.default(this._users, this._database, socket, this._io);
        });
    }
    _useEngineHandlers() {
        logger.debug("_useEngineHandlers");
        /**
         * Проверка первичного handshake запроса перед установкой сокет-соединения
         * Проверка происходит в 3 этапа:
         *   - проверка сессии в заголовках запроса
         *   - проверка сессии в объекте запроса
         *   - проверка сессии в Redis хранилище (RedisStore)
         */
        this._io.engine.on("initial_headers", async (headers, req) => {
            // Удостоверимся, что заголовки содержат заголовок с куки
            if (headers.hasOwnProperty(COOKIE_HEADER_NAME) && headers[COOKIE_HEADER_NAME][0]) {
                const sessionHeader = headers[COOKIE_HEADER_NAME][0];
                // Удостоверимся, что куки с id сессии в заголовках совпадает с id сессии в объекте запроса
                if (sessionHeader.includes(req.sessionID)) {
                    const isRedisSessionExists = await this._checkRedisSession(req.sessionID);
                    if (isRedisSessionExists) {
                        logger.info((0, i18n_1.t)("socket.handshake_connection_successful"));
                        return;
                    }
                }
            }
            new index_1.SocketError((0, i18n_1.t)("socket.error.sessions_not_match_or_exists", {
                sessionId: req.sessionID,
            }));
        });
        // Не нормальное отключение io
        this._io.engine.on("connection_error", (error) => {
            const { code, message, context } = error;
            new index_1.SocketError((0, i18n_1.t)("socket.error.engine_socket", {
                code: code.toString(),
                message,
                context: context.name,
            }));
        });
    }
    // Проверка сессии в RedisStore
    async _checkRedisSession(sessionId) {
        return Boolean(await this._redisWork.get(enums_1.RedisKeys.SESS, sessionId));
    }
    // Обработчик ошибок в мидлваре сокет соединения (вывод ошибки в консоль, в логгер и возврат в "connect_error" на клиенте)
    _handleMiddlewareError(text, next) {
        const socketError = new index_1.SocketError((0, i18n_1.t)(text));
        return next(socketError.setMiddlewareError());
    }
    async close() {
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
        await this._io.close();
        logger.info((0, i18n_1.t)("socket.stopped"));
    }
}
exports.default = SocketWorks;
//# sourceMappingURL=Socket.js.map