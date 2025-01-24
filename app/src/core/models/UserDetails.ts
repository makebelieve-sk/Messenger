import EventEmitter from "eventemitter3";
import i18next from "../../service/i18n";
import { IUserDetails } from "../../types/models.types";
import { muchSelected } from "../../utils";
import { getMonthName } from "../../utils/time";
import { ApiRoutes } from "../../types/enums";
import { UserDetailsEvents } from "../../types/events";
import Request from "../Request";

const NOT_COMPLITE = i18next.t("profile-module.not_complete");

// Класс, описывающий сущность "Дополнительная информация о пользователе"
export default class UserDetails extends EventEmitter {
    private _details!: IUserDetails;

    constructor(private readonly _request: Request) {
        super();
        this._getUserDetail()
    }

    get sex() {
        return this._details?.sex || ""
    }
    set sex(value: string) {
        if (this._details) {
            this._details.sex = value
        }
    }
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

    // Обновление дополнительной информации о пользователе
    updateDetails(details: IUserDetails) {
        this._details = details
        console.log(this._details);

    }

    //
    private _getUserDetail() {
        this._request.get({
            route: ApiRoutes.getUserDetail,
            setLoading: (isLoading: boolean) => {
                this.emit(UserDetailsEvents.SET_LOADING, isLoading)
            },
            successCb: (data: { success: boolean, userDetail: IUserDetails }) => {
                this._details = data.userDetail
                console.log(`Emitting UPDATE event. Details:`, this._details);
                this.emit(UserDetailsEvents.UPDATE)
            }
        });
    }
}