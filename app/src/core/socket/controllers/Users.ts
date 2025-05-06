import { SocketActions } from "common-types";

import type ProfilesController from "@core/controllers/ProfilesController";
import { validateHandleEvent } from "@core/socket/validation";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useGlobalStore from "@store/global";
import resetAllStores from "@store/index";
import { type SocketType } from "@custom-types/socket.types";
import toFormatAck from "@utils/to-format-socket-ack";

const logger = Logger.init("Socket:UsersController");

// Контроллер по управлению сокет событиями пользователя
export default class UsersController {
	constructor(
		private readonly _socket: SocketType, 
		private readonly _myId: string,
		private readonly _profilesController: ProfilesController,
	) {
		this._init();
	}

	private _init() {
		// Список всех онлайн пользователей
		this._socket.on(SocketActions.GET_ALL_USERS, ({ users }, callback) => {
			const validateData = validateHandleEvent(SocketActions.GET_ALL_USERS, { users });

			if (validateData.success) {
				logger.info(`${i18next.t("core.socket.online_users")} [users=${JSON.stringify(users)}]`);

				const filteredUsers = users.filter((onlineUser) => onlineUser && onlineUser.id !== this._myId);

				if (filteredUsers.length) {
					useGlobalStore.getState().setOnlineUsers(filteredUsers);
				}
			}

			toFormatAck(validateData, callback);
		});

		// Новый пользователь онлайн
		this._socket.on(SocketActions.GET_NEW_USER, ({ user }, callback) => {
			const validateData = validateHandleEvent(SocketActions.GET_NEW_USER, { user });

			if (validateData.success) {
				logger.info(`${i18next.t("core.socket.new_user_connected")} [user=${JSON.stringify(user)}]`);
				useGlobalStore.getState().addOnlineUsers(user);
			}

			toFormatAck(validateData, callback);
		});

		// Пользователь отключился
		this._socket.on(SocketActions.USER_DISCONNECT, ({ userId }, callback) => {
			const validateData = validateHandleEvent(SocketActions.USER_DISCONNECT, { userId });

			if (validateData.success) {
				logger.info(`${i18next.t("core.socket.user_disconnected")} [userId=${userId}]`);
				useGlobalStore.getState().deleteOnlineUser(userId);
			}

			toFormatAck(validateData, callback);
		});

		// Пользователь отключился
		this._socket.on(SocketActions.LOG_OUT, (_, callback) => {
			const validateData = validateHandleEvent(SocketActions.LOG_OUT);

			if (validateData.success) {
				logger.debug(i18next.t("core.socket.user_disconnected"));
				// Очищаем все состояния на клиенте и удаляем текущий профиль
				resetAllStores();
				this._profilesController.removeProfile();
			}

			toFormatAck(validateData, callback, () => {
				// Закрываем сокет-соединение, если валидация прошла успешно
				if (validateData.success) {
					this._disconnect();
				}
			});
		});
	}

	private _disconnect() {
		logger.debug("disconnect");
		this._socket.disconnect();
	}
};