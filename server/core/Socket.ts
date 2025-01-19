import express from "express";
import { Server } from "socket.io";
import http from "http";

import { t } from "../service/i18n";
import Database from "./Database";
import { SocketType, SocketWithUser } from "../types/socket.types";
import { SocketActions } from "../types/enums";
import { ISafeUser } from "../types/user.types";
import { UsersType } from "../types";
import { SocketError } from "../errors";

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

    constructor(
        private readonly _server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>, 
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
        this._useSocketBus();
        this._useEngineHandlers();
    }

    private _useMiddlewares() {
        // Милдвар сокета - добавление сессии express-session в соединение socket.io
        this.io.engine.use(this._expressSession);

        // Милдвар сокета - проверка пользователя в сокете
        this.io.use((socket: SocketWithUser, next) => {
            const user: ISafeUser = socket.handshake.auth.user;
    
            if (!user) {
                next(new SocketError(t("socket.error.user_id_not_found")));
            }
    
            socket.user = user;
            next();
        });
    }

    private _getUser(userId: string) {
        return this._users.get(userId);
    }

    private _useSocketBus() {
        this.io.on("connection", async (socket: SocketWithUser) => {
            const socketID = socket.id;

            // Уведомление по сокету меня самого
            const notifyMe = (type: any, payload?: Object) => {
                this._io.to(socketID).emit(type, payload);
            };

            // Обработка ошибок
            const handleError = (message: string) => {
                const nextError = new SocketError(message);
        
                if (socket && socketID) {
                    notifyMe(SocketActions.SOCKET_CHANNEL_ERROR, {
                        message: nextError.message
                    });
                }
            }

            try {
                this._socket = socket;
                console.log("Пример сессии: ", (this._socket.request as express.Request).session);

                const userId = (this._socket.user as ISafeUser).id;
                const socketID = this._socket.id;
                const user = this._getUser(userId);

                if (!user) {
                    throw new SocketError(t("socket.error.user_with_id_not_exists", { userId }));
                }

                // Обновляем объект подключившегося пользователя
                this._users.set(userId, {
                    ...user,
                    socketID
                });
            
                // Уведомление по сокету конкретного пользователя
                const notifyAnotherUser = (userTo: string, type: any, payload?: Object) => {
                    // Если получатель - это я, то выводим ошибку
                    if (userTo === userId) {
                        throw new SocketError(t("socket.error.not_correct_user_id_in_socket", { userTo }));
                    }

                    const findUser = this._getUser(userTo);

                    if (findUser) {
                        this.io.to(findUser.socketID).emit(type, payload);
                    }
                };
            
                // Уведомление по сокету всех пользователей, кроме себя самого
                const notifyAnotherUsers = (allUsers: { id: string }[], type: any, payload?: Object) => {
                    for (const user of allUsers) {
                        const findUser = this._getUser(user.id);

                        if (findUser && user.id !== userId) {
                            this.io.to(findUser.socketID).emit(type, payload);
                        }
                    }
                };

                // Обновляем дату моего последнего захода
                await this._database.models.userDetails.update(
                    { lastSeen: null },
                    { where: { userId } }
                );

                // Отправляем всем пользователям обновленный список активных пользователей
                socket.emit(SocketActions.GET_ALL_USERS, Array.from(this._users.values()).map(user => user));

                // Оповещаем все сокеты (кроме себя) о новом пользователе
                socket.broadcast.emit(SocketActions.GET_NEW_USER, user);

                // Уведомляем конкретного пользователя о действиях дружбы
                socket.on(SocketActions.FRIENDS, (data) => {
                    switch (data.type) {
                        case SocketActions.ADD_TO_FRIENDS: {
                            notifyAnotherUser(data.payload.to, SocketActions.ADD_TO_FRIENDS);
                            break;
                        }

                        case SocketActions.ACCEPT_FRIEND: {
                            const { to, acceptedFriend } = data.payload;
                            notifyAnotherUser(to, SocketActions.ACCEPT_FRIEND, { user: acceptedFriend as ISafeUser });
                            break;
                        }

                        case SocketActions.UNSUBSCRIBE: {
                            notifyAnotherUser(data.payload.to, SocketActions.UNSUBSCRIBE);
                            break;
                        }

                        case SocketActions.BLOCK_FRIEND: {
                            notifyAnotherUser(data.payload.to, SocketActions.BLOCK_FRIEND, { userId });
                            break;
                        }

                        default:
                            handleError(t("socket.error.not_correct_friends_action_type"));
                            break;
                    }
                });

                // Уведомляем всех пользователей чата (кроме себя) об отправке нового сообщения
                socket.on(SocketActions.MESSAGE, ({ data, usersInChat }) => {
                    notifyAnotherUsers(usersInChat, SocketActions.SEND_MESSAGE, { 
                        ...data, 
                        User: { id: userId, firstName: user.firstName, thirdName: user.thirdName, avatarUrl: user.avatarUrl } 
                    });
                });

                // Уведомляем собеседника приватного чата об удалении сообщения
                socket.on(SocketActions.DELETE_MESSAGE, ({ companionId, messageId }) => {
                    notifyAnotherUser(companionId, SocketActions.DELETE_MESSAGE, { messageId });
                });

                // Уведомляем собеседника приватного чата об его удалении
                socket.on(SocketActions.DELETE_CHAT, ({ chatId, companionId }) => {
                    notifyAnotherUser(companionId, SocketActions.DELETE_CHAT, { chatId });
                });

                // Уведомляем всех участников чата (кроме себя) об изменении/редактировании сообщения
                socket.on(SocketActions.EDIT_MESSAGE, ({ data, usersInChat }) => {
                    notifyAnotherUsers(usersInChat, SocketActions.EDIT_MESSAGE, { data });
                });

                // Уведомляем каждого автора сообщения о том, что оно было прочитано
                socket.on(SocketActions.CHANGE_READ_STATUS, ({ isRead, messages }) => {
                    for (const message of messages) {
                        notifyAnotherUser(message.userId, SocketActions.ACCEPT_CHANGE_READ_STATUS, { ...message, isRead });
                    }
                });

                // Уведомляем собеседников чата о том, что идет набор сообщения
                socket.on(SocketActions.NOTIFY_WRITE, ({ isWrite, chatId, usersInChat }) => {
                    notifyAnotherUsers(usersInChat, SocketActions.NOTIFY_WRITE, { isWrite, chatId, userName: user.firstName + " " + user.thirdName });
                });

                // Событие отключения (выполняется немного ранее, чем disconnect) - можно получить доступ к комнатам
                socket.on("disconnecting", (reason) => {
                    console.log(t("socket.disconnecting", { reason }));
                });

                // Отключение сокета
                socket.on("disconnect", async (reason) => {
                    try {
                        console.log(t("socket.socket_disconnected_with_reason", { socketID, reason }));

                        // Добавляем проверку на тот случай, если клиент разорвал соединение (например, закрыл вкладку/браузер)
                        // Иначе через кнопку выхода пользователь уже удаляется из списка
                        if (this._users.has(userId)) {
                            this._users.delete(userId);
                        }

                        // Оповещаем все сокеты (кроме себя) об отключении пользователя
                        socket.broadcast.emit(SocketActions.USER_DISCONNECT, userId);

                        // Обновляем дату моего последнего захода
                        await this._database.models.userDetails.update(
                            { lastSeen: new Date().toUTCString() },
                            { where: { userId } }
                        );
                    } catch (error) {
                        handleError(`${t("socket.error.update_last_seen")}: ${(error as Error).message}`);
                    }
                });
            } catch (error) {
                handleError(`${t("socket.error.socket_work")}: ${(error as Error).message}`);
            }
        });
    }

    private _useEngineHandlers() {
        // Не нормальное отключение io
        this._io.engine.on("connection_error", (error: { req: string; code: number; message: string; context: string; }) => {
            const { req, code, message, context } = error;
            new SocketError(t("socket.error.engine_socket", { req, code: code.toString(), message, context }));
        });
    }

    close() {
        this._io.close();
    }
}