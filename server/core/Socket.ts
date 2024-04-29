import { Server } from "socket.io";
import http from "http";
import { v4 as uuid } from "uuid";

import { ClientToServerEvents, ISocketUsers, InterServerEvents, ServerToClientEvents, SocketWithUser } from "../types/socket.types";
import { IUser } from "../types/models.types";
import { CallNames, CallTypes, ErrorTextsApi, MessageReadStatus, MessageTypes, SocketActions, SocketChannelErrorTypes } from "../types/enums";
import { IFullChatInfo } from "../types/chat.types";
import { getFullName } from "../utils";
import Database from "./Database";

interface IConstructor {
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    users: ISocketUsers;
    database: Database;
};

export default class SocketWorks {
    private _io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any> | undefined = undefined;
    private _server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    private _users: ISocketUsers;
    private _socket: SocketWithUser | undefined = undefined;
    private _database: Database | undefined = undefined;

    constructor({ server, users, database }: IConstructor) {
        this._server = server;
        this._users = users;
        this._database = database;

        this._init();
    }

    get io() {
        return this._io as Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>;
    }

    get socket() {
        return this._socket as SocketWithUser;
    }

    get database() {
        return this._database as Database;
    }

    private _init() {
        this._io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>(this._server, {
            transports: ["websocket"]
        });

        this._useMiddlewares();
        this._useSocketBus();
        this._useEngineHandlers();
    }

    private _useMiddlewares() {
        // Милдвар сокета - проверка пользователя в сокете
        this.io.use((socket: SocketWithUser, next) => {
            const user = socket.handshake.auth.user as IUser;
    
            if (!user) {
                return next(new Error("Не передан пользователь"));
            }
    
            socket.user = user;
            next();
        });
    }

    private _useSocketBus() {
        // Инициализация io
        this.io.on("connection", async (socket: SocketWithUser) => {
            try {
                this._socket = socket;

                if (!socket.user) {
                    throw new Error("Не передан пользователь");
                }

                const userID = socket.user.id;
                const socketID = socket.id;
                const user: IUser = socket.handshake.auth.user || socket.user;

                this._users[userID] = {
                    ...this._users[userID],
                    userID,
                    socketID,
                    user
                };

                // Уведомление по сокету меня самого
                const notifyMe = (type: any, payload?: Object) => {
                    this.io.to(socketID).emit(type, payload);
                };
            
                // Уведомление по сокету конкретного пользователя
                const notifyAnotherUser = (userTo: string, type: any, payload?: Object) => {
                    // Если получатель - это я, то выводим ошибку
                    if (userTo === userID) {
                        throw new Error(`Не подходящий идентификатор пользователя id=${userTo}`);
                    }

                    if (this._users[userTo]) {
                        this.io.to(this._users[userTo].socketID).emit(type, payload);
                    }
                };
            
                // Уведомление по сокету всех пользователей, кроме себя самого
                const notifyAnotherUsers = (allUsers: { id: string }[], type: any, payload?: Object) => {
                    for (const user of allUsers) {
                        if (this._users[user.id] && user.id !== userID) {
                            this.io.to(this._users[user.id].socketID).emit(type, payload);
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
                            notifyAnotherUser(clientId, SocketActions.REMOVE_PEER, { peerId: socketID, userId: userID });
                        });

                        // Уведомляем пользователей, которые еще не приняли звонок о том, что звонок был отменен
                        if (usersInCall && usersInCall.length) {
                            notifyAnotherUsers(usersInCall, SocketActions.CANCEL_CALL);
                        }

                        // Удаляем из своего сокета id звонка 
                        if (this._users[userID] && this._users[userID].call) {
                            this._users[userID].call = undefined;
                            socket.broadcast.emit(SocketActions.NOT_ALREADY_IN_CALL);
                        }

                        // Покидаем комнату (звонок)
                        socket.leave(roomId);
                    } else {
                        notifyMe(SocketActions.SOCKET_CHANNEL_ERROR, {
                            message: ErrorTextsApi.CANNOT_FIND_CALL,
                            type: SocketChannelErrorTypes.CALLS
                        });
                    }
                };

                // Обнляем дату моего последнего захода
                await this.database.models.userDetails.update(
                    { lastSeen: null },
                    { where: { userId: userID } }
                );

                // Отправляем всем пользователям обновленный список активных пользователей
                socket.emit(SocketActions.GET_ALL_USERS, this._users);

                // Оповещаем все сокеты (кроме себя) о новом пользователе
                socket.broadcast.emit(SocketActions.GET_NEW_USER, user);

                // Если мы открываем приложение со второй вкладки
                if (this._users[userID] && this._users[userID].call) {
                    const { id, usersInCall, chatInfo } = this._users[userID].call as { id: string; chatInfo: IFullChatInfo; usersInCall: IUser[]; };

                    notifyMe(SocketActions.ALREADY_IN_CALL, { roomId: id, chatInfo, users: usersInCall });
                }

                // Уведомляем конкретного пользователя о действиях дружбы
                socket.on(SocketActions.FRIENDS, (data) => {
                    switch (data.type) {
                        case SocketActions.ADD_TO_FRIENDS: {
                            notifyAnotherUser(data.payload.to, SocketActions.ADD_TO_FRIENDS);
                            break;
                        }

                        case SocketActions.ACCEPT_FRIEND: {
                            const { to, acceptedFriend } = data.payload;
                            notifyAnotherUser(to, SocketActions.ACCEPT_FRIEND, { user: acceptedFriend as IUser });
                            break;
                        }

                        case SocketActions.UNSUBSCRIBE: {
                            notifyAnotherUser(data.payload.to, SocketActions.UNSUBSCRIBE);
                            break;
                        }

                        case SocketActions.BLOCK_FRIEND: {
                            notifyAnotherUser(data.payload.to, SocketActions.BLOCK_FRIEND, { userId: userID });
                            break;
                        }

                        default:
                            this.io.to(socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                message: "Не передан тип передаваемых данных"
                            });
                            break;
                    }
                });

                // Уведомляем всех пользователей чата (кроме себя) об отправке нового сообщения
                socket.on(SocketActions.MESSAGE, ({ data, usersInChat }) => {
                    notifyAnotherUsers(usersInChat, SocketActions.SEND_MESSAGE, { 
                        ...data, 
                        User: { id: userID, firstName: user.firstName, thirdName: user.thirdName, avatarUrl: user.avatarUrl } 
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

                            if (this._users[userTo.id]) {
                                if (this._users[userID]) {
                                    // Сохраняем id звонка к себе в сокет
                                    this._users[userID].call = { id: roomId, chatInfo, usersInCall };
                                }

                                // Подключаемся в комнату (к звонку)
                                socket.join(roomId);

                                // Уведомляем собеседника о том, что мы ему звоним
                                socket.broadcast.to(this._users[userTo.id].socketID).emit(SocketActions.NOTIFY_CALL, {
                                    roomId,
                                    chatInfo,
                                    users: usersInCall
                                });

                                const transaction = await this.database.sequelize.transaction();

                                try {
                                    // Создаем новую запись звонка в таблице Calls
                                    await this.database.models.calls.create({
                                        id: roomId,
                                        name: CallNames.OUTGOING,
                                        type: CallTypes.SINGLE,
                                        initiatorId,
                                        chatId,
                                    }, { transaction });

                                    // Создаем пользователей в звонке
                                    await this.database.models.usersInCall.bulkCreate(
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

                                    await this.database.models.messages.create({ ...newMessage }, { transaction });

                                    await transaction.commit();
                                } catch (error) {
                                    this.io.to(socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                        message: `Возникла ошибка при создании записей звонка и сообщения в базу данных: ${error}`,
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
                    this.io.to(this._users[userTo].socketID).emit(SocketActions.SET_CALL_STATUS, { status });
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
                                    userId: userID
                                });

                                let clientUserId: string | null = null;

                                // Среди онлайн пользователей ищем id i-ого пользователя в комнате
                                for (let key in this._users) {
                                    if (this._users[key].socketID === clientId) {
                                        clientUserId = this._users[key].userID;
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

                            if (this._users[userID]) {
                                // При принятии звонка сохраняем id звонка у себя в сокете
                                this._users[userID].call = { id: roomId, chatInfo, usersInCall };
                            }

                            // Подключаемся в комнату
                            socket.join(roomId);

                            try {
                                // Обновляем startTime
                                await this.database.models.calls.update(
                                    { startTime: new Date().toUTCString() },
                                    { where: { id: roomId } }
                                );
                            } catch (error) {
                                this.io.to(socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                    message: `Возникла ошибка при обновлении времени начала звонка: ${error}`,
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
                                const transaction = await this.database.sequelize.transaction();

                                try {
                                    // Получаем всех пользователей из комнаты (звонка)
                                    const message = await this.database.models.messages.findOne({
                                        where: { callId: id },
                                        transaction
                                    });
                                    const call = await this.database.models.calls.findByPk(id, { 
                                        include: [{
                                            model: this.database.models.usersInCall,
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
                                                const userId = userInCall.id;

                                                if (this._users[userId]) {
                                                    // Каждому пользователю из звонка шлем уведомление об отрисовке нового сообщения
                                                    this.io.to(this._users[userId].socketID).emit(SocketActions.ADD_NEW_MESSAGE, { newMessage });
                                                }
                                            });
                                        } else {
                                            if (this._users[userID]) {
                                                this.io.to(this._users[userID].socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                                    message: `Не заполнен массив пользователей в звонке: ${id}`,
                                                    type: SocketChannelErrorTypes.CALLS
                                                });
                                            }
                                        }
                                    } else {
                                        if (this._users[userID]) {
                                            this.io.to(this._users[userID].socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                                message: `Запись звонка с id = ${id} не найдена.`,
                                                type: SocketChannelErrorTypes.CALLS
                                            });
                                        }
                                    }
                                } catch (error) {
                                    await transaction.rollback();

                                    throw error;
                                }

                                break;
                            }
                            default:
                                if (this._users[userID]) {
                                    this.io.to(this._users[userID].socketID).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                                        message: `Передан неизвестный тип сообщения: ${type}`,
                                        type: SocketChannelErrorTypes.CALLS
                                    });
                                }
                                break;
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

                    const rooms = Array.from(socket.rooms);

                    // Выходим из всех комнат только, если пользователь использует 1 (последнюю) вкладку
                    if (rooms && rooms.length) {
                        rooms.forEach(roomId => {
                            leaveRoom({ roomId });
                        });
                    }
                });

                // Отключение сокета
                socket.on("disconnect", async (reason) => {
                    try {
                        console.log(`Сокет с id: ${socketID} отключился по причине: ${reason}`);

                        delete this._users[userID];

                        // Оповещаем все сокеты (кроме себя) об отключении пользователя
                        socket.broadcast.emit(SocketActions.USER_DISCONNECT, userID);

                        // Обновляем дату моего последнего захода
                        await this.database.models.userDetails.update(
                            { lastSeen: new Date().toUTCString() },
                            { where: { userId: userID } }
                        );
                    } catch (error: any) {
                        notifyMe(SocketActions.SOCKET_CHANNEL_ERROR, {
                            message: `Возникла ошибка при обновлении времени последнего захода пользователя: ${error}`,
                        });
                    }
                });
            } catch (error) {
                if (socket && socket.id) {
                    this.io.to(socket.id).emit(SocketActions.SOCKET_CHANNEL_ERROR, {
                        message: `Произошла ошибка при работе с сокетом: ${error}`
                    });
                }
                console.error("Произошла ошибка при работе с сокетом: ", error);
                return null;
            }
        });
    }

    private _useEngineHandlers() {
        // Не нормальное отключение io
        this.io.engine.on("connection_error", (error: { req: string; code: number; message: string; context: string; }) => {
            const { req, code, message, context } = error;
            console.log(`Не нормальное отключение сокета с кодом ${code}.\nОбъект запроса: ${req}.\nТекст ошибки: ${message}.\nДополнительный контекст: ${context}.`);
        });
    }
}