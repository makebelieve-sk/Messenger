import { type NotificationSettings } from "@core/models/NotificationSettings";
import { type Photos } from "@core/models/Photos";
import { type User } from "@core/models/User";
import { type UserDetails } from "@core/models/UserDetails";
import type Request from "@core/Request";
import NotificationSettingsService from "@core/services/NotificationSettingsService";
import PhotosService from "@core/services/PhotosService";
import UserDetailsService from "@core/services/UserDetailsService";
import Logger from "@service/Logger";
import useUserStore from "@store/user";
import type { IApiUser, IApiUserDetails, IUserData } from "@custom-types/api.types";
import { type IPhoto } from "@custom-types/models.types";

const logger = Logger.init("User");

/**
 * Класс, реализовывающий сущность "Пользователь" согласно контракту "Пользователь".
 * Внутренний объект this._user представляет собой данные, которые пришли с сервера.
 * То есть, он может содержать внутри себя необработанные данные (например, null).
 * После редактирования или обновления/удаления аватара this._user становится типом IUser.
 */
export default class UserService implements User {
	private _user!: IApiUser;
	private readonly _userDetails: UserDetails;
	private readonly _notificationSettings?: NotificationSettings;
	private readonly _photos: Photos;

	constructor(private readonly _request: Request, private readonly _userData: IUserData) {
		logger.debug("init");

		const { user, userDetails, notificationSettings } = this._userData;

		this._updateUser(user);

		// Создаем сущность дополнительной информации о пользователе
		this._userDetails = new UserDetailsService(userDetails);

		if (this._userData.isMe && notificationSettings) {
			// Создаем сущность настроек уведомлений
			this._notificationSettings = new NotificationSettingsService(notificationSettings);
		}
		
		// Создаем сущность фотографий
		this._photos = new PhotosService(this._request, this._user.id);
	}

	get photosService() {
		return this._photos;
	}

	get detailsService() {
		return this._userDetails;
	}

	get settingsService() {
		return this._notificationSettings;
	}

	get id() {
		return this._user.id;
	}

	get firstName() {
		return this._user.firstName;
	}

	get secondName() {
		return this._user.secondName || "";
	}

	get thirdName() {
		return this._user.thirdName;
	}

	get phone() {
		return this._user.phone;
	}

	get email() {
		return this._user.email;
	}

	get fullName() {
		return this._user.firstName + " " + this._user.thirdName;
	}

	get avatarUrl() {
		return this._user.avatarUrl || "";
	}

	get avatarCreateDate() {
		return this._user.avatarCreateDate || "";
	}

	// Обновление данных о пользователе при редактировании
	updateUser({ user, userDetails }: { user: IApiUser; userDetails: IApiUserDetails; }) {
		logger.debug("updateUser");

		this._updateUser({
			...this._user,
			...user,
		});
		this._userDetails.updateDetails(userDetails);
	}

	// Изменение аватара пользователя
	changeAvatar(updatedAvatar?: IPhoto) {
		logger.debug(`changeAvatar [value=${updatedAvatar?.path}]`);

		this._updateUser({
			...this._user,
			avatarUrl: updatedAvatar?.path || null,
			avatarCreateDate: updatedAvatar?.createdAt || null,
		});
	}

	// Обновление полей пользователя
	private _updateUser(newUser: IApiUser) {
		this._user = newUser;

		// Уведомление стора об изменении полей пользователя
		useUserStore.getState().setUser({
			id: this.id,
			firstName: this.firstName,
			secondName: this.secondName,
			thirdName: this.thirdName,
			phone: this.phone,
			email: this.email,
			fullName: this.fullName,
			avatarUrl: this.avatarUrl,
			avatarCreateDate: this.avatarCreateDate,
		});
	}
}
