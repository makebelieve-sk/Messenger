import { SocketActions } from "common-types";

import { validateHandleEvent } from "@core/socket/validation";
import Logger from "@service/Logger";
import { type SocketType } from "@custom-types/socket.types";
import toFormatAck from "@utils/to-format-socket-ack";

const logger = Logger.init("Socket:FriendsController");

// Контроллер по управлению сокет событиями друзей
export default class FriendsController {
	constructor(private readonly _socket: SocketType) {
		this._init();
	}

	private _init() {
		// Подписываемся на пользователя
		this._socket.on(SocketActions.ADD_TO_FRIENDS, (_, callback) => {
			const validateData = validateHandleEvent(SocketActions.ADD_TO_FRIENDS);

			if (validateData.success) {
				logger.debug("SocketActions.ADD_TO_FRIENDS");
				// this._dispatch(setFriendNotification(FriendsNoticeTypes.ADD));
			}

			toFormatAck(validateData, callback);
		});

		// Пользователь добавил меня в друзья после моей заявки
		this._socket.on(SocketActions.ACCEPT_FRIEND, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.ACCEPT_FRIEND, { user });

			if (validateData.success) {
				logger.debug(`SocketActions.ACCEPT_FRIEND [userId=${user.id}]`);
				// this._dispatch(addFriend(user));
			}

			toFormatAck(validateData, callback);
		});

		// Отписываемся от пользователя
		this._socket.on(SocketActions.UNSUBSCRIBE, (_, callback) => {
			const validateData = validateHandleEvent(SocketActions.UNSUBSCRIBE);

			if (validateData.success) {
				logger.debug("SocketActions.UNSUBSCRIBE");
				// this._dispatch(setFriendNotification(FriendsNoticeTypes.REMOVE));
			}

			toFormatAck(validateData, callback);
		});

		// Пользователь заблокировал меня
		this._socket.on(SocketActions.BLOCK_FRIEND, ({ userId }, callback) => {
			const validateData = validateHandleEvent(SocketActions.BLOCK_FRIEND, { userId });

			if (validateData.success) {
				logger.debug(`SocketActions.BLOCK_FRIEND [userId=${userId}]`);
				// this._dispatch(deleteFriend(userId));
			}

			toFormatAck(validateData, callback);
		});
	}
};