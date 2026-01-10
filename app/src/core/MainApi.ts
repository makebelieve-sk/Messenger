import { ApiRoutes } from "common-types";

import { type IUpdatedAvatar } from "@components/ui/change-avatar";
import type ProfilesController from "@core/controllers/ProfilesController";
import type Request from "@core/Request";
import type Socket from "@core/socket/Socket";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useAuthStore from "@store/auth";
import useFriendsStore from "@store/friends";
import useUIStore from "@store/ui";
import useUserStore from "@store/user";
import { type IUserData } from "@custom-types/api.types";
import { Cookies } from "@custom-types/enums";
import type { IUser, IUserDetails } from "@custom-types/models.types";
import { encrypt } from "@utils/index";

const logger = Logger.init("MainApi");

// Класс, содержит все HTTP запросы, которые являются глобальными по отношению к приложению
export default class MainApi {
	constructor(
		private readonly _request: Request,
		private readonly _profilesController: ProfilesController,
		private readonly _socket: Socket,
	) {
		logger.debug("init");
		this._getMe();
	}

	getAnotherUser(userId: string) {
		this._request.post({
			route: ApiRoutes.getUser,
			data: { id: userId },
			successCb: ({ user, userDetails }: { user: IUser; userDetails: IUserDetails; }) => {
				logger.info(`get info about another user: ${JSON.stringify(user)}`);
				this._initNewUser({ user, userDetails });
			},
		});
	}

	googleLogin() {
		this._request.get({
			route: ApiRoutes.googleLogin,
		});
	}

	signIn(data: Object) {
		encrypt(data).then((encryptedData) => {
			if (!encryptedData) {
				useUIStore.getState().setError(i18next.t("sign-in.error.cypher-error"));
				return;
			}
			this._request.post({
				route: ApiRoutes.signIn,
				data: {
					...data,
					encrypted: encryptedData,
					tempId: "hash",
				},
				setLoading: (isLoading: boolean) => {
					useAuthStore.getState().setSignInLoading(isLoading);
				},
				successCb: (userData: IUserData) => {
					logger.debug(`successfully sign in: ${JSON.stringify(userData.user)}`);
					this._initNewUser({ ...userData, isMe: true });
				},
			});
		});
	}

	signUp(data: Object) {
		encrypt(data).then((encryptedData) => {
			if (!encryptedData) {
				useUIStore.getState().setError(i18next.t("sign-up.error.cypher-error"));
				return;
			}
			this._request.post({
				route: ApiRoutes.signUp,
				data: {
					...data,
					encrypted: encryptedData,
					tempId: "hash",
				},

				setLoading: (isLoading: boolean) => {
					useAuthStore.getState().setSignUpLoading(isLoading);
				},
				successCb: (userData: IUserData) => {
					logger.debug(`successfully sing up: ${JSON.stringify(userData.user)}`);
					this._initNewUser({ ...userData, isMe: true });
				},
			});
		});
	}

	logout() {
		this._request.get({ route: ApiRoutes.logout });
	}

	completePhone(phone: string) {
		const formattedPhone = this._formatPhoneToE164(phone);
		
		this._request.put({
			route: ApiRoutes.completePhone,
			data: {
				phone: formattedPhone,
			},
			successCb: (userData: { success: boolean; user: IUser; }) => {
				logger.debug(`successfully complete phone: ${JSON.stringify(userData.user)}`);
				// Обновляем пользователя в store
				useUserStore.getState().setUser(userData.user);
				// Редиректим на профиль
				window.location.href = ApiRoutes.profile;
			},
		});
	}

	uploadAvatarAuth(
		route: ApiRoutes,
		data: Object,
		setLoading: (isLoading: boolean) => void,
		cb: (data: IUpdatedAvatar) => void,
	) {
		this._request.post({
			route,
			data,
			setLoading,
			successCb: cb,
			config: { headers: { "Content-Type": "multipart/form-data" } },
		});
	}

	getFriendsNotification() {
		this._request.get({
			route: ApiRoutes.getFriendsNotification,
			successCb: (data: { success: boolean; friendsNotification: number; }) => {
				useFriendsStore.getState().setFriendsNotification(data.friendsNotification);
			},
		});
	}

	getMessageNotification() {
		// this._request.get({
		// 	route: ApiRoutes.getMessageNotification,
		// 	successCb: (_: { success: boolean; unreadChatsCount: number }) => {
		// 		// this._dispatch(setMessageNotification(data.unreadChatsCount));
		// 	},
		// });
	}

	openFile(data: Object) {
		this._request.post({ route: ApiRoutes.openFile, data });
	}

	private _getMe() {
		this._request.get({
			route: ApiRoutes.getMe,
			setLoading: (isLoading: boolean) => {
				useUserStore.getState().setLoadingUser(isLoading);
			},
			successCb: (userData: IUserData) => {
				logger.info(`get info about yourself: ${JSON.stringify(userData.user)}`);
				this._initNewUser({ ...userData, isMe: true });
			},
			needCookie: Cookies.PUBLIC_KEY,
		});
	}

	/**
		* Обработка добавления нового пользователя в приложении.
		* Если это создание моего профиля - инициализируем сокет-соединение и авторизуемся.
		*/
	private _initNewUser(userData: IUserData) {
		this._profilesController.createProfile(userData);

		if (userData.isMe) {
			this._socket.init(userData.user.id);
		}
	}

	// Форматируем телефон в формат E.164
	private _formatPhoneToE164(phone: string): string {
		const digits = phone.replace(/\s/g, "").replace("(", "").replace(")", "");
		return "+" + digits;
	}
};