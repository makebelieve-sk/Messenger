import EventEmitter from "events";

import Logger from "@service/logger";
import { SocketActions } from "@custom-types/enums";
import { SocketEvents } from "@custom-types/events";
import { UsersType } from "@custom-types/index";
import { SocketWithUser } from "@custom-types/socket.types";

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
        // Преобразовываем список пользователей, при этом, не отправляя поле sockets на клиент
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return Array.from(this._users.values()).map(({ sockets, ...rest }) => rest);
    }

    private _init() {
        logger.debug("_init");

        // Отправляем всем пользователям обновленный список активных пользователей
        this.emit(SocketEvents.SEND, SocketActions.GET_ALL_USERS, { users: this._allUsers });

        // Оповещаем все сокеты (кроме себя) о новом пользователе только в том случае, если есть другие пользователи и количество сокет-соединений текущего пользователя одно
        if (this._otherUsers.length && this._socket.user.sockets.size === 1) {
            this.emit(SocketEvents.SEND_BROADCAST, SocketActions.GET_NEW_USER, { user: this._socket.user });
        }
    }
}