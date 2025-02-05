import Logger from "@service/Logger";
import { FriendsNoticeTypes, SocketActions } from "@custom-types/enums";
import { AppDispatch } from "@custom-types/redux.types";
import { SocketType } from "@custom-types/socket.types";
import { addFriend, deleteFriend } from "@store/friend/slice";
import { setFriendNotification } from "@store/main/slice";

const logger = Logger.init("Socket:FriendsController");

// Контроллер по управлению сокет событиями друзей
export default class FriendsController {
    constructor(private readonly _socket: SocketType, private readonly _dispatch: AppDispatch) {
        this._init();
    }

    private _init() {
        // Подписываемся на пользователя
        this._socket.on(SocketActions.ADD_TO_FRIENDS, () => {
            logger.debug("SocketActions.ADD_TO_FRIENDS");
            this._dispatch(setFriendNotification(FriendsNoticeTypes.ADD));
        });

        // Пользователь добавил меня в друзья после моей заявки
        this._socket.on(SocketActions.ACCEPT_FRIEND, ({ user }) => {
            logger.debug(`SocketActions.ACCEPT_FRIEND [userId=${user.id}]`);
            this._dispatch(addFriend(user));
        });

        // Отписываемся от пользователя
        this._socket.on(SocketActions.UNSUBSCRIBE, () => {
            logger.debug("SocketActions.UNSUBSCRIBE");
            this._dispatch(setFriendNotification(FriendsNoticeTypes.REMOVE));
        });

        // Пользователь заблокировал меня
        this._socket.on(SocketActions.BLOCK_FRIEND, ({ userId }) => {
            logger.debug(`SocketActions.BLOCK_FRIEND [userId=${userId}]`);
            this._dispatch(deleteFriend(userId));
        });
    }
}