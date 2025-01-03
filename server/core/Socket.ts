import express from "express";
import { Server } from "socket.io";
import http from "http";
import { v4 as uuid } from "uuid";

import { ClientToServerEvents, ISocketData, InterServerEvents, ServerToClientEvents, SocketWithUser } from "../types/socket.types";
import { CallNames, CallTypes, ErrorTextsApi, MessageReadStatus, MessageTypes, SocketActions, SocketChannelErrorTypes } from "../types/enums";
import { UsersType } from "../types";
import { ISafeUser } from "../types/user.types";
import { getFullName } from "../utils";
import Database from "./Database";
import { SocketError } from "../errors";

const CLIENT_URL = process.env.CLIENT_URL as string;
const SOCKET_METHOD = process.env.SOCKET_METHOD as string;
const SOCKET_PING_INTARVAL = parseInt(process.env.SOCKET_PING_INTARVAL as string);
const SOCKET_PING_TIMEOUT = parseInt(process.env.SOCKET_PING_TIMEOUT as string);
const SOCKET_UPGRADE_TIMEOUT = parseInt(process.env.SOCKET_UPGRADE_TIMEOUT as string);
const SOCKET_MAX_DISCONNECTION_DURATION = parseInt(process.env.SOCKET_MAX_DISCONNECTION_DURATION as string);

// Класс, отвечает за установку сокет соединения с клиентом по транспорту websocket
export default class SocketWorks {
    private _io!: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ISocketData>;
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
        this._io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ISocketData>(this._server, {
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
                next(new SocketError(ErrorTextsApi.USER_ID_NOT_GIVEN));
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

            // Обрабокта ошибок
            const handleError = (message: string, type?: SocketChannelErrorTypes) => {
                const nextError = new SocketError(message);
        
                if (socket && socketID) {
                    notifyMe(SocketActions.SOCKET_CHANNEL_ERROR, {
                        message: nextError.message,
                        type
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
                    throw new SocketError(`Пользователя с id=${userId} не существует.`);
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
                        throw new SocketError(`Не подходящий идентификатор пользователя id=${userTo} (необходимо использовать метод notifyMe)`);
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

                // Выход из комнаты
                const leaveRoom = ({ roomId, usersInCall }: { roomId: string; usersInCall?: { id: string; }[]; }) => {
                    // Получаем всех пользователей из комнаты (звонка)
                    const clientsInRoom = Array.from(this.io.sockets.adapter.rooms.get(roomId) || []);

                    if (clientsInRoom && clientsInRoom.length) {
                        clientsInRoom.forEach((clientId) => {
                            // Уведомляем других участников звонка о нашем уходе
                            notifyAnotherUser(clientId, SocketActions.REMOVE_PEER, { peerId: socketID, userId });
                        });

                        // Уведомляем пользователей, которые еще не приняли звонок о том, что звонок был отменен
                        if (usersInCall && usersInCall.length) {
                            notifyAnotherUsers(usersInCall, SocketActions.CANCEL_CALL);
                        }

                        const findUser = this._getUser(userId);

                        // Удаляем из своего сокета id звонка 
                        if (findUser && findUser.call) {
                            findUser.call = undefined;
                            socket.broadcast.emit(SocketActions.NOT_ALREADY_IN_CALL);
                        }

                        // Покидаем комнату (звонок)
                        socket.leave(roomId);
                    } else {
                        handleError(ErrorTextsApi.CANNOT_FIND_CALL, SocketChannelErrorTypes.CALLS);
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

                // Если мы открываем приложение со второй вкладки
                // if (user && user.call) {
                //     const { id, usersInCall, chatInfo } = user.call;

                //     notifyMe(SocketActions.ALREADY_IN_CALL, { roomId: id, chatInfo, users: usersInCall });
                // }

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
                            handleError(ErrorTextsApi.INCORRECT_TYPE_IN_FRIENDS);
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

                // Начало звонка (одиночный/групповой)=====================================================================================================
                socket.on(SocketActions.CALL, async ({ roomId, users: usersInCall, chatInfo }) => {
                    const { chatId, chatName, chatAvatar, chatSettings, isSingle, initiatorId } = chatInfo;

                    // Если я уже в этой комнате, то выводим уведомление на фронт
                    if (Array.from(socket.rooms).includes(roomId)) {
                        socket.emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                            message: `Вы уже находитесь в звонке: ${chatName}`
                        });
                    }

                    if (usersInCall && usersInCall.length) {
                        // Одиночный звонок
                        if (isSingle) {
                            const userTo = usersInCall[1];
                            const findUser = this._getUser(userTo.id);
                            const findMe = this._getUser(userId);

                            if (findUser) {
                                if (findMe) {
                                    // Сохраняем id звонка к себе в сокет
                                    findMe.call = { id: roomId, chatInfo, usersInCall };
                                }

                                // Подключаемся в комнату (к звонку)
                                socket.join(roomId);

                                // Уведомляем собеседника о том, что мы ему звоним
                                socket.broadcast.to(findUser.socketID).emit(SocketActions.NOTIFY_CALL, {
                                    roomId,
                                    chatInfo,
                                    users: usersInCall
                                });

                                const transaction = await this._database.sequelize.transaction();

                                try {
                                    // Создаем новую запись звонка в таблице Calls
                                    await this._database.models.calls.create({
                                        id: roomId,
                                        name: CallNames.OUTGOING,
                                        type: CallTypes.SINGLE,
                                        initiatorId,
                                        chatId,
                                    }, { transaction });

                                    // Создаем пользователей в звонке
                                    await this._database.models.usersInCall.bulkCreate(
                                        usersInCall.map(user => ({ id: uuid(), userId: user.id, callId: roomId })),
                                        { transaction }
                                    );

                                    // Создаем запись звонка в таблице Messages
                                    const newMessage = {
                                        id: uuid(),
                                        userId: initiatorId,
                                        chatId,
                                        type: MessageTypes.CALL,
                                        createDate: new Date().toUTCString(),
                                        message: "Звонок",
                                        isRead: MessageReadStatus.READ,
                                        callId: roomId
                                    };

                                    await this._database.models.messages.create({ ...newMessage }, { transaction });

                                    await transaction.commit();
                                } catch (error) {
                                    const nextError = error instanceof SocketError
                                        ? error
                                        : new SocketError((error as Error).message);

                                    this.io.to(socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                        message: `Возникла ошибка при создании записей звонка и сообщения в базу данных: ${nextError.message}`,
                                        type: SocketChannelErrorTypes.CALLS
                                    });

                                    await transaction.rollback();
                                }
                            } else {
                                this.io.to(socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                    message: `Невозможно начать звонок, так как собеседник ${userTo.friendName} не в сети`,
                                    type: SocketChannelErrorTypes.CALLS
                                });
                            }
                        } else {
                            // Групповой звонок
                            // TODO
                            // Для каждого id проверять на наличие себя в комнате (если нет - добавлять) 
                            // и отправлять уведомление о звонке каждому собеседнику (проходить циклом)
                        }
                    } else {
                        this.io.to(socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                            message: `Невозможно начать звонок, так как не ${isSingle ? "передан собеседник" : "переданы собеседники"}`,
                            type: SocketChannelErrorTypes.CALLS
                        });
                    }
                });

                // Смена статуса звонка
                socket.on(SocketActions.CHANGE_CALL_STATUS, ({ status, userTo }) => {
                    const findUser = this._getUser(userTo);

                    if (findUser) {
                        this.io.to(findUser.socketID).emit(SocketActions.SET_CALL_STATUS, { status });
                    }
                });

                // Звонок принят
                socket.on(SocketActions.ACCEPT_CALL, async ({ roomId, chatInfo, usersInCall }) => {
                    if (roomId && chatInfo && this._users) {
                        const { chatId, chatName, chatAvatar, chatSettings, isSingle } = chatInfo;

                        // Если я уже в этой комнате, то выводим уведомление
                        if (Array.from(socket.rooms).includes(roomId)) {
                            socket.emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                message: `Вы уже находитесь в звонке: ${chatName}`
                            });
                        }

                        // Получаем всех пользователей из комнаты (звонка)
                        const clientsInRoom = Array.from(this.io.sockets.adapter.rooms.get(roomId) || []);

                        if (clientsInRoom && clientsInRoom.length) {
                            // Событием ADD_PEER - меняем статус на время разговора (если не установлено, иначе устанавливаем)
                            clientsInRoom.forEach(clientId => {
                                // Каждому пользователю из комнаты шлем уведомление о новом подключении (обо мне) - не создаем оффер
                                this.io.to(clientId).emit(SocketActions.ADD_PEER, {
                                    peerId: socketID,
                                    createOffer: false,
                                    userId
                                });

                                let clientUserId: string | null = null;

                                // Среди онлайн пользователей ищем id i-ого пользователя в комнате
                                for (let key in this._users) {
                                    const findUser = this._getUser(key);

                                    if (findUser && findUser.socketID === clientId) {
                                        clientUserId = findUser.id;
                                    }
                                }

                                if (clientUserId) {
                                    // Себе отправляем информацию о каждом пользователе в комнате - создаем оффер
                                    socket.emit(SocketActions.ADD_PEER, {
                                        peerId: clientId,
                                        createOffer: true,
                                        userId: clientUserId,
                                    });
                                }
                            });

                            const findMe = this._getUser(userId);

                            if (findMe) {
                                // При принятии звонка сохраняем id звонка у себя в сокете
                                findMe.call = { id: roomId, chatInfo, usersInCall };
                            }

                            // Подключаемся в комнату
                            socket.join(roomId);

                            try {
                                // Обновляем startTime
                                await this._database.models.calls.update(
                                    { startTime: new Date().toUTCString() },
                                    { where: { id: roomId } }
                                );
                            } catch (error) {
                                const nextError = error instanceof SocketError
                                    ? error
                                    : new SocketError((error as Error).message);

                                this.io.to(socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                    message: `Возникла ошибка при обновлении времени начала звонка: ${nextError.message}`,
                                    type: SocketChannelErrorTypes.CALLS
                                });
                            }
                        }
                    } else {
                        this.io.to(socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                            message: "Возникла ошибка при принятии звонка, возможно звонок был уже завершён",
                            type: SocketChannelErrorTypes.CALLS
                        });
                    }
                });

                // Передача кандидата
                socket.on(SocketActions.TRANSFER_CANDIDATE, ({ peerId, iceCandidate }) => {
                    this.io.to(peerId).emit(SocketActions.GET_CANDIDATE, {
                        peerId: socketID,
                        iceCandidate,
                    });
                });

                // Передача моего созданного предложения другим участникам звонка
                socket.on(SocketActions.TRANSFER_OFFER, ({ peerId, sessionDescription }) => {
                    this.io.to(peerId).emit(SocketActions.SESSION_DESCRIPTION, {
                        peerId: socketID,
                        sessionDescription,
                    });
                });

                // Изменение одного из стримов (потоков) аудио/видео
                socket.on(SocketActions.CHANGE_STREAM, ({ type, value, roomId }) => {
                    // Уведомляем всех участников звонка об изменении потока аудио/видео
                    // Получаем всех пользователей из комнаты (звонка)
                    const clientsInRoom = Array.from(this.io.sockets.adapter.rooms.get(roomId) || []);

                    if (clientsInRoom && clientsInRoom.length) {
                        clientsInRoom.forEach(clientId => {
                            this.io.to(clientId).emit(SocketActions.CHANGE_STREAM, {
                                peerId: socketID,
                                type,
                                value
                            });
                        });
                    }
                });

                // Уведомление других участников о том, что я сейчас говорю/молчу
                socket.on(SocketActions.IS_TALKING, ({ roomId, isTalking }) => {
                    if (roomId) {
                        // Получаем всех пользователей из комнаты (звонка)
                        const clientsInRoom = Array.from(this.io.sockets.adapter.rooms.get(roomId) || []);

                        if (clientsInRoom && clientsInRoom.length) {
                            clientsInRoom.forEach(clientId => {
                                this.io.to(clientId).emit(SocketActions.IS_TALKING, {
                                    peerId: socketID,
                                    isTalking,
                                });
                            });
                        }
                    }
                });

                // Завершение звонка
                socket.on(SocketActions.END_CALL, leaveRoom);

                // Уведомление об отрисовке сообщения на фронте (звонок/)=======================================================================================================
                socket.on(SocketActions.GET_NEW_MESSAGE_ON_SERVER, async ({ id, type }) => {
                    if (id) {
                        switch (type) {
                            case MessageTypes.CALL: {
                                const transaction = await this._database.sequelize.transaction();

                                try {
                                    // Получаем всех пользователей из комнаты (звонка)
                                    const message = await this._database.models.messages.findOne({
                                        where: { callId: id },
                                        transaction
                                    });
                                    const call = await this._database.models.calls.findByPk(id, { 
                                        include: [{
                                            model: this._database.models.usersInCall,
                                            as: "UsersInCall",
                                            where: { callId: id }
                                        }], 
                                        transaction 
                                    });

                                    if (call) {
                                        call.endTime = new Date().toUTCString();
                                        await call.save();
                                    }

                                    await transaction.commit();

                                    if (message && call) {
                                        const newMessage = {
                                            ...message,
                                            Call: call
                                        };
        
                                        const usersInCall = call.UsersInCall;
        
                                        if (usersInCall && usersInCall.length) {
                                            usersInCall.forEach(userInCall => {
                                                const findUser = this._getUser(userInCall.id);

                                                if (findUser) {
                                                    // Каждому пользователю из звонка шлем уведомление об отрисовке нового сообщения
                                                    this.io.to(findUser.socketID).emit(SocketActions.ADD_NEW_MESSAGE, { newMessage });
                                                }
                                            });
                                        } else {
                                            handleError(`Не заполнен массив пользователей в звонке: ${id}`, SocketChannelErrorTypes.CALLS);
                                        }
                                    } else {
                                        handleError(`Запись звонка с id = ${id} не найдена.`, SocketChannelErrorTypes.CALLS);
                                    }
                                } catch (error) {
                                    await transaction.rollback();
                                    // Пробрасываем ошибку выше, так как там присутствует обработка SocketError
                                    throw error;
                                }

                                break;
                            }
                            default: {
                                handleError(`Передан неизвестный тип сообщения: ${type}`, SocketChannelErrorTypes.CALLS);
                                break;
                            }
                        }
                    }
                });

                // Уведомляем собеседников чата о том, что идет набор сообщения
                socket.on(SocketActions.NOTIFY_WRITE, ({ isWrite, chatId, usersInChat }) => {
                    notifyAnotherUsers(usersInChat, SocketActions.NOTIFY_WRITE, { isWrite, chatId, userName: getFullName(user) });
                });

                // Событие отключения (выполняется немного ранее, чем disconnect) - можно получить доступ к комнатам
                socket.on("disconnecting", (reason) => {
                    console.log("[SOCKET.disconnecting]: ", reason);

                    // const rooms = Array.from(socket.rooms);

                    // // Выходим из всех комнат только, если пользователь использует 1 (последнюю) вкладку
                    // if (rooms && rooms.length) {
                    //     rooms.forEach(roomId => {
                    //         leaveRoom({ roomId });
                    //     });
                    // }
                });

                // Отключение сокета
                socket.on("disconnect", async (reason) => {
                    try {
                        console.log(`Сокет с id: ${socketID} отключился по причине: ${reason}`);

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
                        handleError(`Возникла ошибка при обновлении времени последнего захода пользователя: ${(error as Error).message}`);
                    }
                });
            } catch (error) {
                handleError(`Произошла ошибка при работе с сокетом: ${(error as Error).message}`);
            }
        });
    }

    private _useEngineHandlers() {
        // Не нормальное отключение io
        this._io.engine.on("connection_error", (error: { req: string; code: number; message: string; context: string; }) => {
            const { req, code, message, context } = error;
            new SocketError(`Не нормальное отключение сокета с кодом ${code}.\nОбъект запроса: ${req}.\nТекст ошибки: ${message}.\nДополнительный контекст: ${context}.`);
        });
    }

    close() {
        this._io.close();
    }
}