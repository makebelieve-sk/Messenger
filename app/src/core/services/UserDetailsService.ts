import EventEmitter from "eventemitter3";

import i18next from "@service/i18n";
import Logger from "@service/Logger";
import Request from "@core/Request";
import { UserDetails } from "@core/models/UserDetails";
import { muchSelected } from "@utils/index";
import { getMonthName } from "@utils/date";
import { UserDetailsEvents } from "@custom-types/events";
import { IUserDetails } from "@custom-types/models.types";
import { ApiRoutes } from "@custom-types/enums";

const logger = Logger.init("UserDetails");
const NOT_COMPLETE = i18next.t("profile-module.not_complete");

// Класс, реализовывающий сущность "Дополнительная информация о пользователе" согласно контракту "Пользователь"
export default class UserDetailsService extends EventEmitter implements UserDetails {
  private _details!: IUserDetails;

    constructor(private readonly _request: Request) {
        super();
        this._getUserDetail()
    }

    get sex() {
        return this._details?.sex || NOT_COMPLETE;
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
        return this._details && this._details.city ? this._details.city : NOT_COMPLETE;
    }

    get work() {
        return this._details && this._details.work ? this._details.work : NOT_COMPLETE;
    }

    // Трансформация дня рождения пользователя
    private _transformBirthday() {
        if (!this._details || !this._details.city) {
            return NOT_COMPLETE;
        }

        const dates = this._details.birthday.split("-");
    
        return dates[2] + getMonthName(+dates[1] - 1) + ". " + dates[0];
    };

    // Возврат общего текста
    private _getText(...args: [number, string[]]) {
        return muchSelected(...args);
    }

    // Обновление дополнительной информации о пользователе
    editDetails(details: IUserDetails) {
        logger.debug(`editDetails [detailsUserId=${details.userId}]`);
        this._details = details;
    }

    // Получение дополнительной информации о пользователе
    updateDetails() {
        this._getUserDetail();
    }

    // Получение дополнительной информации о пользователе
    private _getUserDetail() {
        this._request.get({
            route: ApiRoutes.getUserDetail,
            setLoading: (isLoading: boolean) => {
                this.emit(UserDetailsEvents.SET_LOADING, isLoading);
            },
            successCb: (data: { success: boolean, userDetail: IUserDetails }) => {
                this.editDetails(data.userDetail);
                logger.info(`_getUserDetail: ${JSON.stringify(this._details)}`);
                this.emit(UserDetailsEvents.UPDATE);
            }
        });
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