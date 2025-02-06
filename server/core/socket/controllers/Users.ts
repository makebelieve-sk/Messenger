import EventEmitter from "events";

import Logger from "../../../service/logger";
import { UsersType } from "../../../types";
import { SocketActions } from "../../../types/enums";
import { SocketWithUser } from "../../../types/socket.types";
import { SocketEvents } from "../../../types/events";

const logger = Logger("Socket:UsersController");

// Контроллер по управлению сокет событиями пользователя
export default class UsersController extends EventEmitter {
    constructor (private readonly _socket: SocketWithUser, private readonly _users: UsersType) {
        super();

        // Задержка необходима для того, чтобы отправка уведомления через emit произошла в следующем цикле event loop
        setTimeout(() => this._init());
    }

    get _otherUsers() {
        return Array.from(this._users.values()).filter(user => user.id !== this._socket.user.id);
    }

    get _allUsers() {
        return Array.from(this._users.values());
    }

    private _init() {
        logger.debug("_init");

        // Отправляем всем пользователям обновленный список активных пользователей
        this.emit(SocketEvents.SEND, SocketActions.GET_ALL_USERS, { users: this._allUsers });

        // Оповещаем все сокеты (кроме себя) о новом пользователе
        if (this._socket.user && this._otherUsers.length) {
            this.emit(SocketEvents.SEND_BROADCAST, SocketActions.GET_NEW_USER, { user: this._socket.user });
        }
    }
}