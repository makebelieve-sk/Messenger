import { ApiRoutes } from "common-types";

import { type IUpdatedAvatar } from "@components/ui/change-avatar";
import type ProfilesController from "@core/controllers/ProfilesController";
import type Request from "@core/Request";
import type Socket from "@core/socket/Socket";
import Logger from "@service/Logger";
import useAuthStore from "@store/auth";
import useFriendsStore from "@store/friends";
import useUserStore from "@store/user";
import { type IUserData } from "@custom-types/api.types";
import type { IUser, IUserDetails } from "@custom-types/models.types";
import { waitForPublicKeyCookie } from "@utils/index";

const logger = Logger.init("MainApi");

// Класс, содержит все HTTP запросы, которые являются глобальными по отношению к приложению
export default class MainApi {
	constructor(
		private readonly _request: Request,
		private readonly _profilesController: ProfilesController,
		private readonly _socket: Socket,
	) {
		logger.debug("init");
		this.getPublicKey();
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

	async getPublicKey() {
		const publicKey = await waitForPublicKeyCookie();
		if (!publicKey) {
			logger.error(`There is no 'publicKey': ${publicKey}`);
			return;
		}
		useAuthStore.getState().setPublicKey(publicKey);
	}

	pemToArrayBuffer(pem: string): ArrayBuffer {
		const b64 = pem
			.replace(/-----BEGIN PUBLIC KEY-----/, "")
			.replace(/-----END PUBLIC KEY-----/, "")
			.replace(/\s+/g, "");
		const binary = atob(b64);
		const buffer = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			buffer[i] = binary.charCodeAt(i);
		}
		return buffer.buffer;
	}

	async importPublicKey(pem: string): Promise<CryptoKey> {
		const keyData = this.pemToArrayBuffer(pem);
		return await window.crypto.subtle.importKey(
			"spki",
			keyData,
			{
				name: "RSA-OAEP",
				hash: "SHA-256",
			},
			false,
			[ "encrypt" ],
		);
	}

	//метод для шифрования
	private async _encrypt(data: object): Promise<string | null> {
		const publicKeyPem = useAuthStore.getState().publicKey;
		if (!publicKeyPem) {
			logger.warn("Нет публичного ключа!");
			return null;
		}

		let cryptoKey: CryptoKey;
		try {
			cryptoKey = await this.importPublicKey(publicKeyPem);
		} catch (e) {
			logger.error(`Ошибка при импорте ключа", ${e}`);
			return null;
		}

		const json = JSON.stringify(data);
		const encoded = new TextEncoder().encode(json);

		let cipherBuffer: ArrayBuffer;
		try {
			cipherBuffer = await window.crypto.subtle.encrypt(
				{
					name: "RSA-OAEP",
				},
				cryptoKey,
				encoded,
			);
		} catch (e) {
			logger.error(`Ошибка при шифровании через WebCrypto:, ${e}`);
			return null;
		}

		// base64‑encode результат
		const uint8 = new Uint8Array(cipherBuffer);
		const b64 = btoa(String.fromCharCode(...uint8));
		return b64;
	}

	signIn(data: Object) {
		this._encrypt(data).then((encryptedData) => {
			if (!encryptedData) {
				logger.error("Не удалось зашифровать данные");
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
		this._encrypt(data).then((encryptedData) => {
			if (!encryptedData) {
				logger.error("Не удалось зашифровать данные");
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
};