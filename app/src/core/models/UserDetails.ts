import { IUserDetails } from "../../types/models.types";
import { muchSelected } from "../../utils";
import { getMonthName } from "../../utils/time";

const NOT_COMPLITE = "Не указано";

// Класс, описывающий сущность "Дополнительная информация о пользователе"
export default class UserDetails {
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
        return this._getText(count, ["друг", "друга", "друзей"]);
    }

    // Получение текста для разного количества подписчиков
    getSubscribersText(count: number) {
        return this._getText(count, ["подписчик", "подписчика", "подписчиков"]);
    }

    // Получение текста для разного количества фотографий
    getPhotosText(count: number) {
        return this._getText(count, ["фотография", "фотографии", "фотографий"]);
    }

    // Получение текста для разного количества аудиозаписей
    getAudiosText(count: number) {
        return this._getText(count, ["аудиозапись", "аудиозаписи", "аудиозаписей"]);
    }

    // Получение текста для разного количества видеозаписей
    getVideosText(count: number) {
        return this._getText(count, ["видеозапись", "видеозаписи", "видеозаписей"]);
    }
}