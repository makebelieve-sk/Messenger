import { Request } from "express";
import EventEmitter from "events";
import { Socket } from "socket.io";

import Database from "@core/Database";
import UsersController from "@core/socket/controllers/Users";
import FriendsController from "@core/socket/controllers/Friends";
import MessagesController from "@core/socket/controllers/Messages";
import { validateEmitEvent } from "@core/socket/validation";
import Logger from "@service/logger";
import { t } from "@service/i18n";
import { HandleArgsType, IAck, ServerToClientEvents, SocketWithUser } from "@custom-types/socket.types";
import { UsersType } from "@custom-types/index";
import { SocketActions } from "@custom-types/enums";
import { SocketEvents } from "@custom-types/events";
import { SocketError } from "@errors/index";

const logger = Logger("SocketController");

const SOCKET_ACK_TIMEOUT = parseInt(process.env.SOCKET_ACK_TIMEOUT as string);

type SocketEventHandler = <T extends keyof ServerToClientEvents>(
    type: T,
    data: HandleArgsType<ServerToClientEvents[T]>
) => Promise<void>;

type SocketToEventHandler = <T extends keyof ServerToClientEvents>(
    socketTo: string,
    type: T,
    data: HandleArgsType<ServerToClientEvents[T]>
) => Promise<void>;

// Класс, отвечает за работу текущего сокет-соединения
export default class SocketController extends EventEmitter {
    private _usersController!: UsersController;
    private _friendsController!: FriendsController;
    private _messagesController!: MessagesController;

    constructor(private readonly _users: UsersType, private readonly _database: Database, private readonly _socket: SocketWithUser) {
        super();

        this._init();
    }

    private async _init() {
        const userId = this._socket.user.id;

        logger.info("Session example [session=%j]", (this._socket.request as Request).session);
        logger.debug("_init [socketId=%s, userId=%s]", this._socket.id, userId);

        // Обновляем дату моего последнего захода
        await this._database.models.userDetails.update(
            { lastSeen: null },
            { where: { userId } }
        );

        this._usersController = new UsersController(this._socket, this._users);
        this._friendsController = new FriendsController(this._socket);
        this._messagesController = new MessagesController(this._socket);

        this._bindListeners();

        // Событие отключения (выполняется немного ранее, чем disconnect) - можно получить доступ к комнатам
        this._socket.on("disconnecting", reason => {
            logger.info(t("socket.disconnecting", { reason }));
        });

        // Отключение сокета
        this._socket.on("disconnect", async reason => {
            try {
                logger.info(t("socket.socket_disconnected_with_reason", { socketId: this._socket.id, reason }));

                // Добавляем проверку на тот случай, если клиент разорвал соединение (например, закрыл вкладку/браузер)
                // Иначе через кнопку выхода пользователь уже удаляется из списка
                if (this._users.has(userId)) {
                    this._users.delete(userId);
                }

                // Если в системе остались другие пользователи
                if (this._users.size) {
                    // Оповещаем все сокеты (кроме себя) об отключении пользователя
                    this.sendBroadcast(SocketActions.USER_DISCONNECT, { userId });
                }

                // Обновляем дату моего последнего захода
                await this._database.models.userDetails.update(
                    { lastSeen: new Date().toUTCString() },
                    { where: { userId } }
                );
            } catch (error) {
                this._handleError(t("socket.error.update_last_seen", { message: (error as Error).message }));
            }
        });
    }

    private _getUser(userId: string) {
        return this._users.get(userId);
    }

    // Метод обработки ошибки (создание ошибки на сервере и вывод в логи + отправка ошибки на клиент для показа там)
    private _handleError(message: string) {
        const nextError = new SocketError(message);

        if (this._socket && this._socket.id) {
            this.send(SocketActions.SOCKET_CHANNEL_ERROR, { message: nextError.message });
        }
    }

    private _bindListeners() {
        this._usersController.on(SocketEvents.SEND, ((type, ...data) => {
            this.send(type, ...data);
        }) as SocketEventHandler);

        this._usersController.on(SocketEvents.SEND_BROADCAST, ((type, ...data) => {
            this.sendBroadcast(type, ...data);
        }) as SocketEventHandler);

        this._friendsController.on(SocketEvents.HANDLE_ERROR, (error: string) => {
            this._handleError(error);
        });

        this._friendsController.on(
            SocketEvents.NOTIFY_ANOTHER_USER,
            <T extends keyof ServerToClientEvents>(userTo: string, type: T, data: HandleArgsType<ServerToClientEvents[T]>) => {
                // Если получатель - это я, то выводим ошибку
                if (userTo === this._socket.user.id) {
                    throw new SocketError(t("socket.error.not_correct_user_id_in_socket", { userTo }));
                }

                const findUser = this._getUser(userTo);

                if (findUser) {
                    this.sendTo(findUser.socketId, type, data);
                }
            }
        );

        this._messagesController.on(
            SocketEvents.NOTIFY_ALL_ANOTHER_USERS,
            <T extends keyof ServerToClientEvents>(users: { id: string }[], type: T, data: HandleArgsType<ServerToClientEvents[T]>) => {
                for (const user of users) {
                    const findUser = this._getUser(user.id);

                    if (findUser && user.id !== this._socket.user.id) {
                        this.sendTo(findUser.socketId, type, data);
                    }
                }
            }
        );
    }

    // Обработка ack при отправке события от одного клиента
    private _handleEmit(response: IAck, type: keyof ServerToClientEvents) {
        const { success, message, timestamp } = response;

        success
            ? logger.debug(t("socket.emit_handled", { type, timestamp: (timestamp as number).toString() }))
            : this._handleError(t("socket.error.handle_event_on_client", { type, message: message as string }));

        return success;
    }

    // Обработка ack при отправке события от нескольких клиентов
    private _handleEmits(response: IAck[], type: keyof ServerToClientEvents) {
        if (!response || !response.length) {
            this._handleError(t("socket.error.emit_broadcast_empty_response"));
            return;
        }

        for (let i = 0; i < response.length; i++) {
            const isSuccess = this._handleEmit(response[i], type);

            if (!isSuccess) {
                break;
            }

            logger.debug(t("socket.emit_handled", { type, timestamp: (response[i].timestamp as number).toString() }));
        }
    }

    // Основной метод отправки события с сервера текущему конкретному клиенту с добавлением ack (подтверждение обработки клиентом данного события)
    send: SocketEventHandler = async (type, data) => {
        try {
            const validateData = validateEmitEvent(this._handleError.bind(this), type, data);

            if (validateData) {
                const response = await (this._socket as Socket).timeout(SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);

                this._handleEmit(response, type);
            }
        } catch (error) {
            this._handleError(t("socket.error.emit_with_ack", { type, message: (error as Error).message }));
        }
    }

    // Основной метод отправки события с сервера на все подключенные клиенты кроме текущего с добавлением ack (подтверждение обработки клиентом данного события)
    sendBroadcast: SocketEventHandler = async (type, data) => {
        try {
            const validateData = validateEmitEvent(this._handleError.bind(this), type, data);

            if (validateData) {
                const response = await (this._socket as Socket).broadcast.timeout(SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);

                this._handleEmits(response, type);
            }
        } catch (error) {
            this._handleError(t("socket.error.emit_broadcast_with_ack", { type, message: (error as Error).message }));
        }
    }

    // Основной метод отправки события с сервера конкретному клиенту с добавлением ack (подтверждение обработки клиентом данного события)
    sendTo: SocketToEventHandler = async (socketTo, type, data) => {
        try {
            const validateData = validateEmitEvent(this._handleError.bind(this), type, data);

            if (validateData) {
                const response = await (this._socket as Socket).to(socketTo).timeout(SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);

                this._handleEmit(response, type);
            }
        } catch (error) {
            this._handleError(t("socket.error.emit_to_with_ack", { type, message: (error as Error).message }));
        }
    }
}