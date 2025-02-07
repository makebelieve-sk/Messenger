import EventEmitter from "eventemitter3";

import Logger from "@service/Logger";
import { validateHandleEvent } from "@core/socket/validation";
import { addFriend, deleteFriend } from "@store/friend/slice";
import { setFriendNotification } from "@store/main/slice";
import { FriendsNoticeTypes, SocketActions } from "@custom-types/enums";
import { AppDispatch } from "@custom-types/redux.types";
import { SocketType } from "@custom-types/socket.types";
import { SocketEvents } from "@custom-types/events";

const logger = Logger.init("Socket:FriendsController");

// Контроллер по управлению сокет событиями друзей
export default class FriendsController extends EventEmitter {
    constructor(private readonly _socket: SocketType, private readonly _dispatch: AppDispatch) {
        super();

        this._init();
    }

    private _init() {
        // Подписываемся на пользователя
        this._socket.on(SocketActions.ADD_TO_FRIENDS, (callback) => {
            const validateData = validateHandleEvent(SocketActions.ADD_TO_FRIENDS, {});
            
            if (validateData.success) {
                logger.debug("SocketActions.ADD_TO_FRIENDS");
                this._dispatch(setFriendNotification(FriendsNoticeTypes.ADD));
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Пользователь добавил меня в друзья после моей заявки
        this._socket.on(SocketActions.ACCEPT_FRIEND, ({ user }, callback) => {
            const validateData = validateHandleEvent(SocketActions.ACCEPT_FRIEND, { user });
            
            if (validateData.success) {
                logger.debug(`SocketActions.ACCEPT_FRIEND [userId=${user.id}]`);
                this._dispatch(addFriend(user));
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Отписываемся от пользователя
        this._socket.on(SocketActions.UNSUBSCRIBE, (callback) => {
            const validateData = validateHandleEvent(SocketActions.UNSUBSCRIBE, {});

            if (validateData.success) {
                logger.debug("SocketActions.UNSUBSCRIBE");
                this._dispatch(setFriendNotification(FriendsNoticeTypes.REMOVE));
            }
            
            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Пользователь заблокировал меня
        this._socket.on(SocketActions.BLOCK_FRIEND, ({ userId }, callback) => {
            const validateData = validateHandleEvent(SocketActions.BLOCK_FRIEND, { userId });
            
            if (validateData.success) {
                logger.debug(`SocketActions.BLOCK_FRIEND [userId=${userId}]`);
                this._dispatch(deleteFriend(userId));
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });
    }
}