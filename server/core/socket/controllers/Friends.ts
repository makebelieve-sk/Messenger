import { SocketActions } from "common-types";
import EventEmitter from "events";

import { validateHandleEvent } from "@core/socket/validation";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { SocketEvents } from "@custom-types/events";
import { type SocketWithUser } from "@custom-types/socket.types";

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
		this._socket.on(SocketActions.FRIENDS, (data, callback) => {
			const validateData = validateHandleEvent(SocketActions.FRIENDS, data);

			if (validateData.success) {
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
					this._handleError(t("socket.error.not_correct_friends_action_type"));
					break;
				}
			}

			const ackData = validateData.success ? { success: true, timestamp: Date.now() } : { success: false, message: validateData.message };

			callback(ackData);
		});
	}

	private _handleError(error: string) {
		this.emit(SocketEvents.HANDLE_ERROR, error);
	}
}
