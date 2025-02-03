import Logger from "../../service/logger";
import { UsersType } from "../../types";
import { SocketActions } from "../../types/enums";
import { SocketWithUser } from "../../types/socket.types";

const logger = Logger("Socket:UsersController");

// Контроллер по управлению сокет событиями пользователя
export default class UsersController {
    constructor (private readonly _socket: SocketWithUser, private readonly _users: UsersType) {
        this._init();
    }

    private _init() {
        logger.debug("_init");

        // Отправляем всем пользователям обновленный список активных пользователей
        this._socket.emit(SocketActions.GET_ALL_USERS, Array.from(this._users.values()).map(user => user));

        // Оповещаем все сокеты (кроме себя) о новом пользователе
        if (this._socket.user) {
            this._socket.broadcast.emit(SocketActions.GET_NEW_USER, this._socket.user);
        }
    }
}