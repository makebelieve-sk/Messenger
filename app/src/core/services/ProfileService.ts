import { ApiRoutes } from "common-types";

import { type IUpdatedAvatar } from "@components/ui/change-avatar";
import { type Profile } from "@core/models/Profile";
import { type User } from "@core/models/User";
import type Request from "@core/Request";
import UserService from "@core/services/UserService";
import { type IFormValues } from "@pages/Edit";
import Logger from "@service/Logger";
import useImagesCarouselStore from "@store/images-carousel";
import useProfileStore from "@store/profile";
import useUIStore from "@store/ui";
import { type IUserData } from "@custom-types/api.types";
import type { IUser, IUserDetails } from "@custom-types/models.types";

const logger = Logger.init("Profile");

/**
 * Класс, являющийся полной сущностью пользователя на стороне клиента.
 * Содержит все данные, относящиеся к пользователю, согласно контракту "Профиль пользователя".
 */
export default class ProfileService implements Profile {
	private readonly _user: User;
	private readonly _isMe: boolean;

	constructor(private readonly _request: Request, private readonly _userData: IUserData) {
		logger.debug("init");

		// Помечаем, является ли этот профиль моим
		this._isMe = Boolean(this._userData.isMe);

		// Создаем сущность пользователя
		this._user = new UserService(this._request, this._userData);
	}

	get isMe() {
		return this._isMe;
	}

	get userService() {
		return this._user;
	}

	get photosService() {
		return this._user.photosService;
	}

	// Удаление аккаунта пользователя
	deleteAccount() {
		this._request.get({
			route: ApiRoutes.deleteAccount,
			setLoading: (isLoading: boolean) => {
				useProfileStore.getState().setDeleteAccountLoading(isLoading);
			},
			successCb: () => {
				useProfileStore.getState().setDeleteAccountLoading(false);
				useUIStore.getState().setSettingsModal(false);
			},
		});
	}

	//-------------------------------------------------
	// Методы главной фотографии (аватара)
	//-------------------------------------------------
	// Обновление аватара пользователя
	onSetAvatar({ newAvatar, newPhoto }: IUpdatedAvatar) {
		logger.debug(`onSetAvatar [newAvatar=${newAvatar.path}]`);

		this._user.changeAvatar(newAvatar);
		this._user.photosService.addPhotoFromAvatar(newPhoto);
	}

	// Удаление аватара
	onDeleteAvatar() {
		this._request.post({
			route: ApiRoutes.deletePhoto,
			data: { imageUrl: this._user.avatarUrl },
			setLoading: (isLoading: boolean) => {
				useProfileStore.getState().setDeleteAvatarLoading(isLoading);
			},
			successCb: () => {
				this._user.changeAvatar();
			},
		});
	}

	// Клик по аватару пользователя
	onClickAvatar() {
		useImagesCarouselStore.getState().setAvatar(true);
	}

	//-------------------------------------------------
	// Методы блока с друзьями
	//-------------------------------------------------
	// Получение друзей топ-6
	getFriends() {
		// this._request.get({
		// 	route: ApiRoutes.getCountFriends,
		// 	setLoading,
		// 	successCb: (_: { success: boolean; friendsCount: number; topFriends: IUser[] | null; subscribersCount: number }) => {
		// 		// this._dispatch(setFriendsCount(data.friendsCount));
		// 		// this._dispatch(setSubscribersCount(data.subscribersCount));
		// 		// this._dispatch(setTopFriends(data.topFriends));
		// 	},
		// });
	}

	//-------------------------------------------------
	// Методы страницы редактирования
	//-------------------------------------------------
	// Редактирование
	editInfo(result: IFormValues) {
		this._request.put({
			route: ApiRoutes.editInfo,
			data: { ...result, userId: this._user.id },
			setLoading: (value: boolean) => {
				useProfileStore.getState().setEditLoading(value);
			},
			successCb: (data: { user: IUser; userDetails: IUserDetails }) => {
				this._user.updateUser(data);
				useProfileStore.getState().setShowEditAlert(true);
			},
		});
	}
};