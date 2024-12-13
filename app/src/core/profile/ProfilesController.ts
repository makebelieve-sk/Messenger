import EventEmitter from "eventemitter3";

import Profile from "./Profile";
import Request from "../Request";
import { AppDispatch } from "../../types/redux.types";
import { MainClientEvents } from "../../types/events";
import { MY_ID } from "../../utils/constants";

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
            if (showError) this.emit(MainClientEvents.ERROR, `Профиля с id: ${userId} не существует.`);
            return undefined;
        }

        return profile;
    }

    // Добавление нового профиля пользователя
    addProfile(userId: string = MY_ID) {
        if (this._profiles.has(userId)) {
            this.emit(MainClientEvents.ERROR, `Профиль с id: ${userId} уже существует.`);
            return undefined;
        }

        const newProfile = new Profile(userId, this._request, this._dispatch);

        this._profiles.set(userId, newProfile);
        this._bindListeners(newProfile);
    }

    // Удаление профиля пользователя
    removeProfile(userId: string = MY_ID) {
        const profile = this.getProfile(userId);

        if (!profile) {
            this.emit(MainClientEvents.ERROR, `Профиля с id: ${userId} не существует.`);
        }

        
    }

    // Слушатель события класса Profile
    private _bindListeners(profile: Profile) {
        profile.on(MainClientEvents.GET_ME, () => this.emit(MainClientEvents.GET_ME));
    }
}