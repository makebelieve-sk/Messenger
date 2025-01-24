import EventEmitter from "eventemitter3";

import Logger from "../../service/Logger";
import Profile from "./Profile";
import Request from "../Request";
import i18next from "../../service/i18n";
import { AppDispatch } from "../../types/redux.types";
import { MainClientEvents } from "../../types/events";
import { MY_ID } from "../../utils/constants";

const logger = Logger.init("ProfilesController");

// Класс, отвечающий за работу с коллекцией профилей пользователей
export default class ProfilesController extends EventEmitter {
    private _profiles: Map<string, Profile> = new Map();

    constructor(private readonly _request: Request, private readonly _dispatch: AppDispatch) {
        super();

        logger.debug("init ProfilesController");
        this.addProfile(MY_ID);
    }

    get profiles() {
        return this._profiles;
    }

    // Получение объекта пользователя
    getProfile(userId: string = MY_ID, showError: boolean = true) {
        logger.debug(`getProfile [userId=${userId}, showError=${showError}]`);

        const profile = this._profiles.get(userId);

        if (!profile) {
            if (showError) this.emit(MainClientEvents.ERROR, i18next.t("core.profiles-controller.error.profile_not_exists", { id: userId }));
            return undefined;
        }

        return profile;
    }

    // Добавление нового профиля пользователя
    addProfile(userId: string = MY_ID) {
        logger.debug(`addProfile [userId=${userId}]`);

        if (this._profiles.has(userId)) {
            this.emit(MainClientEvents.ERROR, i18next.t("core.profiles-controller.error.profile_not_exists", { id: userId }));
            return undefined;
        }

        const newProfile = new Profile(userId, this._request, this._dispatch);

        this._profiles.set(userId, newProfile);
        this._bindListeners(newProfile);
    }

    // Удаление профиля пользователя
    removeProfile(userId: string = MY_ID) {
        logger.debug(`removeProfile [userId=${userId}]`);

        const profile = this.getProfile(userId);

        if (!profile) {
            this.emit(MainClientEvents.ERROR, i18next.t("core.profiles-controller.error.profile_not_exists", { id: userId }));
            return;
        }

        this._profiles.delete(userId);
    }

    // Слушатель события класса Profile
    private _bindListeners(profile: Profile) {
        profile.on(MainClientEvents.GET_ME, () => {
            logger.debug("MainClientEvents.GET_ME");
            this.emit(MainClientEvents.GET_ME);
        });
    }
}