import { type Profile } from "@core/models/Profile";
import Request from "@core/Request";
import ProfileService from "@core/services/ProfileService";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useProfileStore from "@store/profile";
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
			userId = this.getMyProfileId();

			if (!userId) {
				useUIStore.getState().setError(i18next.t("core.profiles-controller.error.my_profile_not_exists"));
				/**
				 * Помечаем тип как never потому, что при отправке ошибки, происходит блокировка действий пользователя,
				 * путем открытия модального окна с ошибкой.
				 */
				return undefined as never;
			}
		}

		const profile = this.checkProfile(userId);

		if (!profile) {
			useUIStore.getState().setError(i18next.t("core.profiles-controller.error.profile_not_exists", { id: userId }));
			/**
			 * Помечаем тип как never потому, что при отправке ошибки, происходит блокировка действий пользователя,
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

		const profile = this.checkProfile(userId);

		if (profile) {
			useUIStore.getState().setError(i18next.t("core.profiles-controller.error.profile_exists", { id: userId }));
			return;
		}

		const newProfile = new ProfileService(this._request, userData);

		this._profiles.set(userId, newProfile);

		// Если профиль не мой - необходимо сбросить флаг загрузки чужого профиля
		if (!newProfile.isMe) {
			useProfileStore.getState().setPrepareAnotherUser(false);
		}
	}

	// Удаление своего профиля (либо выход, либо полноценное удаление)
	removeProfile() {
		logger.debug("removeProfile");

		const myProfileId = this.getMyProfileId();

		if (!myProfileId) {
			useUIStore.getState().setError(i18next.t("core.profiles-controller.error.my_profile_not_exists"));
			return;
		}

		this._profiles.delete(myProfileId);
	}

	// Проверка существования профиля пользователя
	checkProfile(userId?: string) {
		if (!userId) {
			userId = this.getMyProfileId();
		}

		if (!userId || !this._profiles.has(userId)) {
			return null;
		}

		return this._profiles.get(userId);
	}

	// Получение id моего профиля среди всех остальных
	getMyProfileId() {
		let myProfileId: string | undefined = undefined;

		for (const [ profileId, profile ] of this._profiles.entries()) {
			if (profile.isMe) {
				myProfileId = profileId;
				break;
			}
		}

		return myProfileId;
	}
};