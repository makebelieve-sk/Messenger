import { SocketActions } from "common-types";

import { validateHandleEvent } from "@core/socket/validation";
import Logger from "@service/Logger";
import { type SocketType } from "@custom-types/socket.types";
import toFormatAck from "@utils/to-format-socket-ack";
import type ProfilesController from "@core/controllers/ProfilesController";
import { getFriendEntity } from "@utils/friends";
import useFriendsStore from "@store/friends";
import type FriendsControllerType from "@core/controllers/FriendsController";
import useUIStore from "@store/ui";

const logger = Logger.init("Socket:FriendsController");

// Контроллер по управлению сокет событиями друзей
export default class FriendsController {
	private readonly _friendsController: FriendsControllerType;

	constructor(private readonly _socket: SocketType, private readonly _profilesController: ProfilesController) {
		this._friendsController = this._profilesController.getProfile().userService.friendsService.friendsController;

		this._init();
	}

	private _init() {
		// Подписываемся на пользователя
		this._socket.on(SocketActions.FOLLOW_FRIEND, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.FOLLOW_FRIEND, { user });

			if (validateData.success) {
				logger.debug("SocketActions.FOLLOW_FRIEND");

				// Добавляем этого пользователя в список входящих заявок на дружбу
				this._friendsController.incomingRequests.add(getFriendEntity(user));
				this._friendsController.incomingRequests.syncStore();

				// Добавляем уведомление о новой заявке в друзья
				useFriendsStore.getState().addFriendsNotification();

				// Удаляем пользователя из списка возможных друзей
				this._friendsController.searchFriends.remove(user.id);
				this._friendsController.searchFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Добавляем исходящий запрос дружбы (после подписки на кого-то)
		this._socket.on(SocketActions.ADD_OUTGOING_REQUEST, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.ADD_OUTGOING_REQUEST, { user });

			if (validateData.success) {
				logger.debug("SocketActions.ADD_OUTGOING_REQUEST");

				// Добавляем новую запись в исходящих заявках
				this._friendsController.outgoingRequests.add(getFriendEntity(user));
				this._friendsController.outgoingRequests.syncStore();

				// Удаляем запись из возможных друзей
				this._friendsController.searchFriends.remove(user.id);
				this._friendsController.searchFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Отписываемся от пользователя
		this._socket.on(SocketActions.UNFOLLOW_FRIEND, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.UNFOLLOW_FRIEND, { user });

			if (validateData.success) {
				logger.debug("SocketActions.UNFOLLOW_FRIEND");

				// Удаляем пользователя из входящих заявок
				this._friendsController.incomingRequests.remove(user.id);
				this._friendsController.incomingRequests.syncStore();

				// Удаляем пользователя из подписчиков
				this._friendsController.followers.remove(user.id);
				this._friendsController.followers.syncStore();

				// Удаляем его уведомление о дружбе
				useFriendsStore.getState().removeFriendsNotification();

				// Добавляем пользователя в список возможных друзей
				this._friendsController.searchFriends.add(getFriendEntity(user));
				this._friendsController.searchFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Удаляем исходящий запрос дружбы (после подписки на кого-то)
		this._socket.on(SocketActions.REMOVE_OUTGOING_REQUEST, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.REMOVE_OUTGOING_REQUEST, { user });

			if (validateData.success) {
				logger.debug("SocketActions.REMOVE_OUTGOING_REQUEST");

				// Удаляем запись из исходящих заявок
				this._friendsController.outgoingRequests.remove(user.id);
				this._friendsController.outgoingRequests.syncStore();

				// Добавляем запись в список возможных друзей
				this._friendsController.searchFriends.add(getFriendEntity(user));
				this._friendsController.searchFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Добавляем пользователя из подписчиков в друзья
		this._socket.on(SocketActions.ADD_TO_FRIEND, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.ADD_TO_FRIEND, { user });

			if (validateData.success) {
				logger.debug("SocketActions.ADD_TO_FRIEND");

				// Удаляем пользователя из списка исходящих заявок
				this._friendsController.outgoingRequests.remove(user.id);
				this._friendsController.outgoingRequests.syncStore();

				// Добавляем пользователя в список своих друзей
				this._friendsController.myFriends.add(getFriendEntity(user));
				this._friendsController.myFriends.syncStore();

				// Добавляем пользователя в список онлайн друзей
				this._friendsController.onlineFriends.add(getFriendEntity(user));
				this._friendsController.onlineFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Удаляем добавляемого пользвателя из списка подписчиков
		this._socket.on(SocketActions.REMOVE_FOLLOWER, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.REMOVE_FOLLOWER, { user });

			if (validateData.success) {
				logger.debug("SocketActions.REMOVE_FOLLOWER");

				// Удаляем пользователя из подписчиков
				this._friendsController.followers.remove(user.id);
				this._friendsController.followers.syncStore();

				// Добавляем пользователя в список своих друзей
				this._friendsController.myFriends.add(getFriendEntity(user));
				this._friendsController.myFriends.syncStore();

				// Добавляем пользователя в список онлайн друзей
				this._friendsController.onlineFriends.add(getFriendEntity(user));
				this._friendsController.onlineFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Добавляем запрос пользователя на дружбу
		this._socket.on(SocketActions.ADD_FRIEND_REQUEST, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.ADD_FRIEND_REQUEST, { user });

			if (validateData.success) {
				logger.debug("SocketActions.ADD_FRIEND_REQUEST");

				// Удаляем пользователя из списка исходящих заявок
				this._friendsController.outgoingRequests.remove(user.id);
				this._friendsController.outgoingRequests.syncStore();

				// Добавляем пользователя в список своих друзей
				this._friendsController.myFriends.add(getFriendEntity(user));
				this._friendsController.myFriends.syncStore();

				// Добавляем пользователя в список онлайн друзей
				this._friendsController.onlineFriends.add(getFriendEntity(user));
				this._friendsController.onlineFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Удаляем запрос на дружбу от пользователя
		this._socket.on(SocketActions.REMOVE_FRIEND_REQUEST, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.REMOVE_FRIEND_REQUEST, { user });

			if (validateData.success) {
				logger.debug("SocketActions.REMOVE_FRIEND_REQUEST");

				// Удаляем пользователя из входящих заявок
				this._friendsController.incomingRequests.remove(user.id);
				this._friendsController.incomingRequests.syncStore();

				// Удаляем его уведомление о дружбе
				useFriendsStore.getState().removeFriendsNotification();

				// Добавляем пользователя в список своих друзей
				this._friendsController.myFriends.add(getFriendEntity(user));
				this._friendsController.myFriends.syncStore();

				// Добавляем пользователя в список онлайн друзей
				this._friendsController.onlineFriends.add(getFriendEntity(user));
				this._friendsController.onlineFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Отклоняем запрос пользователя на дружбу
		this._socket.on(SocketActions.REJECT_FRIEND_REQUEST, ({ userId }, callback) => {
			const validateData = validateHandleEvent(SocketActions.REJECT_FRIEND_REQUEST, { userId });

			if (validateData.success) {
				logger.debug("SocketActions.REJECT_FRIEND_REQUEST");

				useUIStore.getState().setSnackbarError("Ваша заявка в друзья была отклонена пользователем" + userId);
			}

			toFormatAck(validateData, callback);
		});

		// Удаляем запрос пользователя на дружбу и оставляем его в подписчиках
		this._socket.on(SocketActions.ADD_TO_FOLLOWER, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.ADD_TO_FOLLOWER, { user });

			if (validateData.success) {
				logger.debug("SocketActions.ADD_TO_FOLLOWER");

				// Удаляем пользователя из входящих заявок
				this._friendsController.incomingRequests.remove(user.id);
				this._friendsController.incomingRequests.syncStore();

				// Удаляем его уведомление о дружбе
				useFriendsStore.getState().removeFriendsNotification();

				// Добавляем пользователя в список подписчиков
				this._friendsController.followers.add(getFriendEntity(user));
				this._friendsController.followers.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Удаляем пользователя из друзей
		this._socket.on(SocketActions.DELETE_FRIEND, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.DELETE_FRIEND, { user });

			if (validateData.success) {
				logger.debug("SocketActions.DELETE_FRIEND");

				// Удаляем пользователя из друзей
				this._friendsController.myFriends.remove(user.id);
				this._friendsController.myFriends.syncStore();

				// Удаляем пользователя из списка онлайн друзей
				this._friendsController.onlineFriends.remove(user.id);
				this._friendsController.onlineFriends.syncStore();

				// Добавляем пользователя в список исходящих заявок
				this._friendsController.outgoingRequests.add(getFriendEntity(user));
				this._friendsController.outgoingRequests.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Удаляем пользователя из друзей и помещаем его в список подписчиков
		this._socket.on(SocketActions.DELETING_FRIEND, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.DELETING_FRIEND, { user });

			if (validateData.success) {
				logger.debug("SocketActions.DELETING_FRIEND");

				// Удаляем пользователя из входящих заявок
				this._friendsController.myFriends.remove(user.id);
				this._friendsController.myFriends.syncStore();

				// Удаляем пользователя из списка онлайн друзей
				this._friendsController.onlineFriends.remove(user.id);
				this._friendsController.onlineFriends.syncStore();

				// Добавляем пользователя в список подписчиков
				this._friendsController.followers.add(getFriendEntity(user));
				this._friendsController.followers.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Блокировка пользователя
		this._socket.on(SocketActions.BLOCK_FRIEND, ({ userId }, callback) => {
			const validateData = validateHandleEvent(SocketActions.BLOCK_FRIEND, { userId });

			if (validateData.success) {
				logger.debug("SocketActions.BLOCK_FRIEND");
				
				// Удаляем пользователя из друзей (более нигде этого пользователя увидеть нельзя)
				this._friendsController.myFriends.remove(userId);
				this._friendsController.myFriends.syncStore();

				// Удаляем пользователя из списка онлайн друзей
				this._friendsController.onlineFriends.remove(userId);
				this._friendsController.onlineFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Блокировка пользователя и его добавление в список заблокированных пользователей
		this._socket.on(SocketActions.BLOCKING_FRIEND, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.BLOCKING_FRIEND, { user });

			if (validateData.success) {
				logger.debug("SocketActions.BLOCKING_FRIEND");

				// Удаляем пользователя из друзей
				this._friendsController.myFriends.remove(user.id);
				this._friendsController.myFriends.syncStore();

				// Удаляем пользователя из списка онлайн друзей
				this._friendsController.onlineFriends.remove(user.id);
				this._friendsController.onlineFriends.syncStore();

				// Добавляем пользователя в список заблокированных пользователей
				this._friendsController.blockedUsers.add(getFriendEntity(user));
				this._friendsController.blockedUsers.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Разблокировка пользователя
		this._socket.on(SocketActions.UNBLOCK_FRIEND, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.UNBLOCK_FRIEND, { user });

			if (validateData.success) {
				logger.debug("SocketActions.UNBLOCK_FRIEND");
				
				// Удаляем пользователя из друзей (более нигде этого пользователя увидеть нельзя)
				this._friendsController.searchFriends.add(getFriendEntity(user));
				this._friendsController.searchFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});

		// Разблокировка пользователя и его добавление в список возможных друзей
		this._socket.on(SocketActions.UNBLOCKING_FRIEND, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.UNBLOCKING_FRIEND, { user });

			if (validateData.success) {
				logger.debug("SocketActions.UNBLOCKING_FRIEND");

				// Удаляем пользователя из заблокированных друзей
				this._friendsController.blockedUsers.remove(user.id);
				this._friendsController.blockedUsers.syncStore();

				// Добавляем пользователя в список возможных друзей
				this._friendsController.searchFriends.add(getFriendEntity(user));
				this._friendsController.searchFriends.syncStore();
			}

			toFormatAck(validateData, callback);
		});
	}
};