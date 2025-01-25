import i18next from "@service/i18n";
import { IUserDetails } from "@custom-types/models.types";
import { muchSelected } from "@utils/index";
import { getMonthName } from "@utils/date";
import { UserDetails } from "@core/models/UserDetails";

const NOT_COMPLITE = i18next.t("profile-module.not_complete");

// Класс, реализовывающий сущность "Дополнительная информация о пользователе" согласно контракту "Пользователь"
export default class UserDetailsService implements UserDetails {
    private _details: IUserDetails | null = null;

    constructor() {}

    get details() {
        return this._details;
    }

    get birthday() {
        return this._transformBirthday();
    }

    get city() {
        return this._details && this._details.city ? this._details.city : NOT_COMPLITE;
    }

    get work() {
        return this._details && this._details.work ? this._details.work : NOT_COMPLITE;
    }

    // Трансформация дня рождения пользователя
    private _transformBirthday() {
        if (!this._details || !this._details.city) {
            return NOT_COMPLITE;
        }

        const dates = this._details.birthday.split("-");
    
        return dates[2] + getMonthName(+dates[1] - 1) + ". " + dates[0];
    };

    // Возврат общего текста
    private _getText(...args: [number, string[]]) {
        return muchSelected(...args);
    }

    // Обновление дополнительной информации о пользователе
    setDetails(details: IUserDetails) {
        this._details = details;
    }

    // Получение текста для разного количества друзей
    getFriendsText(count: number) {
        return this._getText(count, [
            i18next.t("profile-module.friends_count_0"), 
            i18next.t("profile-module.friends_count_1"), 
            i18next.t("profile-module.friends_count_2")
        ]);
    }

    // Получение текста для разного количества подписчиков
    getSubscribersText(count: number) {
        return this._getText(count, [
            i18next.t("profile-module.subscribers_count_0"), 
            i18next.t("profile-module.subscribers_count_1"), 
            i18next.t("profile-module.subscribers_count_2")
        ]);
    }

    // Получение текста для разного количества фотографий
    getPhotosText(count: number) {
        return this._getText(count, [
            i18next.t("profile-module.photos_count_0"), 
            i18next.t("profile-module.photos_count_1"), 
            i18next.t("profile-module.photos_count_2")
        ]);
    }

    // Получение текста для разного количества аудиозаписей
    getAudiosText(count: number) {
        return this._getText(count, [
            i18next.t("profile-module.audios_count_0"), 
            i18next.t("profile-module.audios_count_1"), 
            i18next.t("profile-module.audios_count_2")
        ]);
    }

    // Получение текста для разного количества видеозаписей
    getVideosText(count: number) {
        return this._getText(count, [
            i18next.t("profile-module.videos_count_0"), 
            i18next.t("profile-module.videos_count_1"), 
            i18next.t("profile-module.videos_count_2")
        ]);
    }
}