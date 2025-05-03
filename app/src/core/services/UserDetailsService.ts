import { type UserDetails } from "@core/models/UserDetails";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useUserStore from "@store/user";
import { type IApiUserDetails } from "@custom-types/api.types";
import { getMonthName } from "@utils/date";
import { muchSelected } from "@utils/index";

const logger = Logger.init("UserDetails");
const NOT_COMPLETE = i18next.t("profile-module.not_complete");

// Класс, реализовывающий сущность "Дополнительная информация о пользователе" согласно контракту "Пользователь"
export default class UserDetailsService implements UserDetails {
	private _details!: IApiUserDetails;

	constructor(private readonly _userDetails: IApiUserDetails) {
		logger.debug("init UserDetailsService");

		this._updateDetails(this._userDetails);
	}

	get _userId() {
		return this._details.userId;
	}

	get _sex() {
		return this._details?.sex || NOT_COMPLETE;
	}

	get _birthday() {
		return this._transformBirthday() as string;
	}

	get _city() {
		return this._details?.city || NOT_COMPLETE;
	}

	get _work() {
		return this._details?.work || NOT_COMPLETE;
	}

	get _lastSeen() {
		return this._details?.lastSeen || "";
	}

	get _editSex() {
		return this._details?.sex || "";
	}

	get _editBirthday() {
		return this._transformBirthday(true);
	}

	get _editCity() {
		return this._details?.city || "";
	}

	get _editWork() {
		return this._details?.work || "";
	}

	// Обновление дополнительной информации о пользователе при редактировании
	updateDetails(newDetails: IApiUserDetails) {
		logger.debug(`editDetails [detailsUserId=${newDetails.userId}]`);

		this._updateDetails({
			...this._details,
			...newDetails,
		});
	}

	// Получение текста для разного количества друзей
	getFriendsText(count: number) {
		return this._getText(count, [
			i18next.t("profile-module.friends_count_0"),
			i18next.t("profile-module.friends_count_1"),
			i18next.t("profile-module.friends_count_2"),
		]);
	}

	// Получение текста для разного количества подписчиков
	getSubscribersText(count: number) {
		return this._getText(count, [
			i18next.t("profile-module.subscribers_count_0"),
			i18next.t("profile-module.subscribers_count_1"),
			i18next.t("profile-module.subscribers_count_2"),
		]);
	}

	// Получение текста для разного количества фотографий
	getPhotosText(count: number) {
		return this._getText(count, [
			i18next.t("profile-module.photos_count_0"),
			i18next.t("profile-module.photos_count_1"),
			i18next.t("profile-module.photos_count_2"),
		]);
	}

	// Получение текста для разного количества аудиозаписей
	getAudiosText(count: number) {
		return this._getText(count, [
			i18next.t("profile-module.audios_count_0"),
			i18next.t("profile-module.audios_count_1"),
			i18next.t("profile-module.audios_count_2"),
		]);
	}

	// Получение текста для разного количества видеозаписей
	getVideosText(count: number) {
		return this._getText(count, [
			i18next.t("profile-module.videos_count_0"),
			i18next.t("profile-module.videos_count_1"),
			i18next.t("profile-module.videos_count_2"),
		]);
	}

	// Обновление полей дополнительной информации пользователя
	private _updateDetails(newDetails: IApiUserDetails) {
		this._details = newDetails;

		useUserStore.getState().setUserDetails({
			userDetails: {
				userId: this._userId,
				sex: this._sex,
				birthday: this._birthday,
				city: this._city,
				work: this._work,
				lastSeen: this._lastSeen,
			},
			editUserDetails: {
				sex: this._editSex,
				birthday: this._editBirthday,
				city: this._editCity,
				work: this._editWork,
			},
		});
	}

	// Трансформация дня рождения пользователя
	private _transformBirthday(isEdit: boolean = false) {
		if (!this._details || !this._details.birthday) {
			return isEdit ? "" : NOT_COMPLETE;
		}

		const dates = this._details.birthday.split("-");

		return isEdit
			? this._details.birthday
			: dates[2] + getMonthName(+dates[1] - 1) + ". " + dates[0];
	}

	// Возврат общего текста
	private _getText(...args: [number, string[]]) {
		return muchSelected(...args);
	}
};