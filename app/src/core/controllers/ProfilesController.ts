import { type Profile } from "@core/models/Profile";
import Request from "@core/Request";
import ProfileService from "@core/services/ProfileService";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useUIStore from "@store/ui";
import { type IUserData } from "@custom-types/api.types";

const logger = Logger.init("ProfilesController");

// Класс, отвечающий за работу с коллекцией профилей пользователей
export default class ProfilesController {
	private readonly _profiles: Map<string, Profile> = new Map();

	constructor(private readonly _request: Request) {
		logger.debug("init");
	}

	get profiles() {
		return this._profiles;
	}

	// Получение объекта пользователя
	getProfile(userId?: string) {
		if (!userId) {
			userId = this._getMyProfileId();

			if (!userId) {
				/**
				 * Помечаем тип как never потому, что при отправке ошибки выше, происходит блокировка действий пользователя,
				 * путем открытия модального окна с ошибкой.
				 */
				return undefined as never;
			}
		}

		const profile = this._checkProfile(userId);

		if (!profile) {
			useUIStore.getState().setError(i18next.t("core.profiles-controller.error.profile_not_exists", { id: userId }));
			/**
			 * Помечаем тип как never потому, что при отправке ошибки выше, происходит блокировка действий пользователя,
			 * путем открытия модального окна с ошибкой.
			 */
			return undefined as never;
		}

		return profile;
	}

	// Создание нового профиля
	createProfile(userData: IUserData) {
		const userId = userData.user.id;

		logger.debug(`createProfile [userId=${userId}]`);

		const profile = this._checkProfile(userId);

		if (profile) {
			useUIStore.getState().setError(i18next.t("core.profiles-controller.error.profile_exists", { id: userId }));
			return;
		}

		const newProfile = new ProfileService(this._request, userData);

		this._profiles.set(userId, newProfile);
	}

	// Удаление своего профиля (либо выход, либо полноценное удаление)
	removeProfile() {
		logger.debug("removeProfile");

		const myProfileId = this._getMyProfileId();

		if (myProfileId) {
			this._profiles.delete(myProfileId);
		}
	}

	// Получение id моего профиля среди всех остальных
	private _getMyProfileId() {
		let myProfileId: string | undefined;

		for (const [ profileId, profile ] of this._profiles.entries()) {
			if (profile.isMe) {
				myProfileId = profileId;
				break;
			}
		}

		if (!myProfileId) {
			useUIStore.getState().setError(i18next.t("core.profiles-controller.error.my_profile_not_exists"));
			return;
		}

		return myProfileId;
	}

	// Проверка существования профиля пользователя
	private _checkProfile(userId: string) {
		return this._profiles.get(userId) || null;
	}
};