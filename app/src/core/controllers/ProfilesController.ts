import EventEmitter from "eventemitter3";

import ProfileService from "@core/services/ProfileServices";
import Request from "@core/Request";
import { Profile } from "@core/models/Profile";
import i18next from "@service/i18n";
import { AppDispatch } from "@custom-types/redux.types";
import { MainClientEvents } from "@custom-types/events";
import { MY_ID } from "@utils/constants";

// Класс, отвечающий за работу с коллекцией профилей пользователей
export default class ProfilesController extends EventEmitter {
    private _profiles: Map<string, Profile> = new Map();

    constructor(private readonly _request: Request, private readonly _dispatch: AppDispatch) {
        super();

        this.addProfile(MY_ID);
    }

    get profiles() {
        return this._profiles;
    }

    // Получение объекта пользователя
    getProfile(userId: string = MY_ID, showError: boolean = true) {
        const profile = this._profiles.get(userId);

        if (!profile) {
            if (showError) this.emit(MainClientEvents.ERROR, i18next.t("core.profiles-controller.error.profile_not_exists", { id: userId }));
            return undefined;
        }

        return profile;
    }

    // Добавление нового профиля пользователя
    addProfile(userId: string = MY_ID) {
        if (this._profiles.has(userId)) {
            this.emit(MainClientEvents.ERROR, i18next.t("core.profiles-controller.error.profile_not_exists", { id: userId }));
            return undefined;
        }

        const newProfile = new ProfileService(userId, this._request, this._dispatch);

        this._profiles.set(userId, newProfile);
        this._bindListeners(newProfile);
    }

    // Удаление профиля пользователя
    removeProfile(userId: string = MY_ID) {
        const profile = this.getProfile(userId);

        if (!profile) {
            this.emit(MainClientEvents.ERROR, i18next.t("core.profiles-controller.error.profile_not_exists", { id: userId }));
            return;
        }

        this._profiles.delete(userId);
    }

    // Слушатель события класса ProfileService
    private _bindListeners(profile: Profile) {
        profile.on(MainClientEvents.GET_ME, () => this.emit(MainClientEvents.GET_ME));
    }
}