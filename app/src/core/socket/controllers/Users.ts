import EventEmitter from "eventemitter3";

import i18next from "@service/i18n";
import Logger from "@service/Logger";
import { SocketActions } from "@custom-types/enums";
import { AppDispatch } from "@custom-types/redux.types";
import { SocketType } from "@custom-types/socket.types";
import { SocketEvents } from "@custom-types/events";
import { deleteOnlineUser, setOnlineUsers } from "@store/main/slice";

const logger = Logger.init("Socket:UsersController");

// Контроллер по управлению сокет событиями пользователя
export default class UsersController extends EventEmitter {
    constructor (private readonly _socket: SocketType, private readonly _dispatch: AppDispatch) {
        super();

        this._init();
    }

    private _init() {
        // Список всех онлайн пользователей
        this._socket.on(SocketActions.GET_ALL_USERS, (users) => {
            logger.info(`${i18next.t("core.socket.online_users")} [users=${JSON.stringify(users)}]`);

            users.forEach(onlineUser => {
                this.emit(SocketEvents.SET_ONLINE_USER, onlineUser);
            });
        });

        // Новый пользователь онлайн
        this._socket.on(SocketActions.GET_NEW_USER, (newUser) => {
            logger.info(`${i18next.t("core.socket.new_user_connected")} [newUser=${JSON.stringify(newUser)}]`);
            this._dispatch(setOnlineUsers(newUser));
        });

        // Пользователь отключился
        this._socket.on(SocketActions.USER_DISCONNECT, (userId) => {
            logger.info(`${i18next.t("core.socket.user_disconnected")} [userId=${userId}]`);
            this._dispatch(deleteOnlineUser(userId));
        });
    }
}