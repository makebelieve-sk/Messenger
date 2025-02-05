import EventEmitter from "events";

import { t } from "../../../service/i18n";
import Logger from "../../../service/logger";
import { SocketActions } from "../../../types/enums";
import { SocketWithUser } from "../../../types/socket.types";
import { SocketEvents } from "../../../types/events";

const logger = Logger("Socket:FriendsController");

// Контроллер по управлению сокет событиями друзей
export default class FriendsController extends EventEmitter {
    constructor(private readonly _socket: SocketWithUser) {
        super();

        this._init();
    }

    private _init() {
        logger.debug("_init");

        // Уведомляем конкретного пользователя о действиях дружбы
        this._socket.on(SocketActions.FRIENDS, data => {
            switch (data.type) {
                case SocketActions.ADD_TO_FRIENDS: {
                    const { to } = data.payload;

                    logger.debug("SocketActions.ADD_TO_FRIENDS [to=%s, type=%s]", to, SocketActions.ADD_TO_FRIENDS);
                    this.emit(SocketEvents.NOTIFY_ANOTHER_USER, to, SocketActions.ADD_TO_FRIENDS);
                    break;
                }

                case SocketActions.ACCEPT_FRIEND: {
                    const { to, acceptedFriend } = data.payload;

                    logger.debug("SocketActions.ACCEPT_FRIEND [to=%s, type=%s, data=%j]", to, SocketActions.ACCEPT_FRIEND, { user: acceptedFriend });
                    this.emit(SocketEvents.NOTIFY_ANOTHER_USER, to, SocketActions.ACCEPT_FRIEND, { user: acceptedFriend });
                    break;
                }

                case SocketActions.UNSUBSCRIBE: {
                    const { to } = data.payload;

                    logger.debug("SocketActions.UNSUBSCRIBE [to=%s, type=%s]", to, SocketActions.UNSUBSCRIBE);
                    this.emit(SocketEvents.NOTIFY_ANOTHER_USER, to, SocketActions.UNSUBSCRIBE);
                    break;
                }

                case SocketActions.BLOCK_FRIEND: {
                    const { to } = data.payload;

                    logger.debug("SocketActions.BLOCK_FRIEND [to=%s, type=%s, data=%j]", to, SocketActions.BLOCK_FRIEND, { userId: this._socket.user.id });
                    this.emit(SocketEvents.NOTIFY_ANOTHER_USER, to, SocketActions.BLOCK_FRIEND, { userId: this._socket.user.id });
                    break;
                }

                default:
                    logger.debug("unknown SocketActions [type=%s]", data.type);
                    this.emit(SocketEvents.HANDLE_ERROR, t("socket.error.not_correct_friends_action_type"));
                    break;
            }
        });
    }
}