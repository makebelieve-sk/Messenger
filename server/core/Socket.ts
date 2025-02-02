import express from "express";
import { Server, Socket } from "socket.io";

import UsersController from "./socket/Users";
import FriendsController from "./socket/Friends";
import MessagesController from "./socket/Messanges";
import Logger from "../service/logger";
import { t } from "../service/i18n";
import Database from "./Database";
import { ISocketUser, ServerToClientEvents, SocketType, SocketWithUser } from "../types/socket.types";
import { SocketActions } from "../types/enums";
import { SocketEvents } from "../types/events";
import { ServerType, UsersType } from "../types";
import { SocketError } from "../errors";

const logger = Logger("Socket");

const CLIENT_URL = process.env.CLIENT_URL as string;
const SOCKET_METHOD = process.env.SOCKET_METHOD as string;
const SOCKET_PING_INTARVAL = parseInt(process.env.SOCKET_PING_INTARVAL as string);
const SOCKET_PING_TIMEOUT = parseInt(process.env.SOCKET_PING_TIMEOUT as string);
const SOCKET_UPGRADE_TIMEOUT = parseInt(process.env.SOCKET_UPGRADE_TIMEOUT as string);
const SOCKET_MAX_DISCONNECTION_DURATION = parseInt(process.env.SOCKET_MAX_DISCONNECTION_DURATION as string);

// Класс, отвечает за установку сокет соединения с клиентом по транспорту websocket
export default class SocketWorks {
    private _io!: SocketType;
    private _socket!: SocketWithUser;

    private _friendsController!: FriendsController;
    private _messagesController!: MessagesController;

    constructor(
        private readonly _server: ServerType, 
        private readonly _users: UsersType, 
        private readonly _database: Database,
        private readonly _expressSession: express.RequestHandler
    ) {
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
        this._io.on("connection", this._onConnection.bind(this));
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

    private async _onConnection(socket: Socket) {
        try {
            this._socket = socket as SocketWithUser;
            const userId = this._socket.user.id;

            logger.info("Session example [session=%j]", (this._socket.request as express.Request).session);
            logger.debug("_onConnection [socketId=%s, userId=%s]", this._socket.id, userId);

            // Обновляем дату моего последнего захода
            await this._database.models.userDetails.update(
                { lastSeen: null },
                { where: { userId } }
            );

            new UsersController(this._socket, this._users);
            this._friendsController = new FriendsController(this._socket);
            this._messagesController = new MessagesController(this._socket);

            this._bindListeners();

            // Событие отключения (выполняется немного ранее, чем disconnect) - можно получить доступ к комнатам
            this._socket.on("disconnecting", (reason) => {
                logger.info(t("socket.disconnecting", { reason }));
            });

            // Отключение сокета
            this._socket.on("disconnect", async (reason) => {
                try {
                    logger.info(t("socket.socket_disconnected_with_reason", { socketId: this._socket.id, reason }));

                    // Добавляем проверку на тот случай, если клиент разорвал соединение (например, закрыл вкладку/браузер)
                    // Иначе через кнопку выхода пользователь уже удаляется из списка
                    if (this._users.has(userId)) {
                        this._users.delete(userId);
                    }

                    // Оповещаем все сокеты (кроме себя) об отключении пользователя
                    this._socket.broadcast.emit(SocketActions.USER_DISCONNECT, userId);

                    // Обновляем дату моего последнего захода
                    await this._database.models.userDetails.update(
                        { lastSeen: new Date().toUTCString() },
                        { where: { userId } }
                    );
                } catch (error) {
                    this._handleError(`${t("socket.error.update_last_seen")}: ${(error as Error).message}`);
                }
            });
        } catch (error) {
            this._handleError(`${t("socket.error.socket_work")}: ${(error as Error).message}`);
        }
    }

    private _useEngineHandlers() {
        logger.debug("_useEngineHandlers");

        // Не нормальное отключение io
        this._io.engine.on("connection_error", (error: { req: string; code: number; message: string; context: string; }) => {
            const { req, code, message, context } = error;
            new SocketError(t("socket.error.engine_socket", { req, code: code.toString(), message, context }));
        });
    }

    private _getUser(userId: string) {
        return this._users.get(userId);
    }

    private _bindListeners() {
        this._friendsController.on(SocketEvents.HANDLE_ERROR, (error: string) => {
            this._handleError(error);
        });

        this._friendsController.on(SocketEvents.NOTIFY_ANOTHER_USER, (userTo: string, type: keyof ServerToClientEvents, payload?: any) => {
            // Если получатель - это я, то выводим ошибку
            if (userTo === this._socket.user.id) {
                throw new SocketError(t("socket.error.not_correct_user_id_in_socket", { userTo }));
            }

            const findUser = this._getUser(userTo);

            if (findUser) {
                this._io.to(findUser.socketId).emit(type, payload);
            }
        });

        this._messagesController.on(SocketEvents.NOTIFY_ALL_ANOTHER_USERS, (users: { id: string }[], type: keyof ServerToClientEvents, payload?: any) => {
            for (const user of users) {
                const findUser = this._getUser(user.id);

                if (findUser && user.id !== this._socket.user.id) {
                    this._io.to(findUser.socketId).emit(type, payload);
                }
            }
        });
    }

    private _handleError(message: string) {
        const nextError = new SocketError(message);

        if (this._socket && this._socket.id) {
            this._io.to(this._socket.id).emit(SocketActions.SOCKET_CHANNEL_ERROR, nextError.message);
        }
    }

    close() {
        logger.debug("close");

        this._io.close();
    }
}