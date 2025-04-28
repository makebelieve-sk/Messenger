import EventEmitter from "eventemitter3";

import { validateHandleEvent } from "@core/socket/validation";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import { deleteOnlineUser, setOnlineUsers } from "@store/main/slice";
import { SocketActions } from "@custom-types/enums";
import { SocketEvents } from "@custom-types/events";
import { AppDispatch } from "@custom-types/redux.types";
import { SocketType } from "@custom-types/socket.types";

const logger = Logger.init("Socket:UsersController");

// Контроллер по управлению сокет событиями пользователя
export default class UsersController extends EventEmitter {
    constructor (private readonly _socket: SocketType, private readonly _dispatch: AppDispatch) {
        super();

        this._init();
    }

    private _init() {
        // Список всех онлайн пользователей
        this._socket.on(SocketActions.GET_ALL_USERS, ({ users }, callback) => {
            const validateData = validateHandleEvent(SocketActions.GET_ALL_USERS, { users });

            if (validateData.success) {
                logger.info(`${i18next.t("core.socket.online_users")} [users=${JSON.stringify(users)}]`);

                users.forEach(onlineUser => {
                    this.emit(SocketEvents.SET_ONLINE_USER, onlineUser);
                });
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Новый пользователь онлайн
        this._socket.on(SocketActions.GET_NEW_USER, ({ user }, callback) => {
            const validateData = validateHandleEvent(SocketActions.GET_NEW_USER, { user });

            if (validateData.success) {
                logger.info(`${i18next.t("core.socket.new_user_connected")} [user=${JSON.stringify(user)}]`);
                this._dispatch(setOnlineUsers(user));
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Пользователь отключился
        this._socket.on(SocketActions.USER_DISCONNECT, ({ userId }, callback) => {
            const validateData = validateHandleEvent(SocketActions.USER_DISCONNECT, { userId });

            if (validateData.success) {
                logger.info(`${i18next.t("core.socket.user_disconnected")} [userId=${userId}]`);
                this._dispatch(deleteOnlineUser(userId));
            }
            
            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Пользователь отключился
        this._socket.on(SocketActions.LOG_OUT, (_, callback) => {
            const validateData = validateHandleEvent(SocketActions.LOG_OUT);

            if (validateData.success) {
                logger.debug(i18next.t("core.socket.user_disconnected"));
                this.emit(SocketEvents.LOG_OUT);
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback, () => {
                // Закрываем сокет-соединение, если валидация прошла успешно
                if (validateData.success) this._socket.disconnect();
            });
        });
    }
}