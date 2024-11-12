import EventEmitter from "eventemitter3";

import Profile from "./Profile";
import Request from "../Request";
import EmptyProfile from "./EmptyProfile";
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
    public getProfile(userId: string = MY_ID): Profile {
        if (this._profiles.has(userId)) {
            return this._profiles.get(userId)!;
        }

        this.emit(MainClientEvents.ERROR, `Профиля с id: ${userId} не существует.`);
        return new EmptyProfile("", this._request, this._dispatch);
    }

    // Добавление нового профиля пользователя
    public addProfile(userId: string = MY_ID) {
        const newProfile = new Profile(userId, this._request, this._dispatch);

        this._profiles.set(userId, newProfile);
        this._bindListeners(newProfile);
    }

    // Удаление профиля пользователя
    public removeProfile(userId: string = MY_ID) {
        this._profiles.has(userId)
            ? this._profiles.delete(userId)
            : this.emit(MainClientEvents.ERROR, `Профиля с id: ${userId} не существует.`);
    }

    // Слушатель события класса Profile
    private _bindListeners(profile: Profile) {
        profile.on(MainClientEvents.GET_ME, () => this.emit(MainClientEvents.GET_ME));
    }
}