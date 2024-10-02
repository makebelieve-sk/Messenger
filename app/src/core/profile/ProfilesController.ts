import EventEmitter from "eventemitter3";

import { AppDispatch } from "../../types/redux.types";
import Profile from "./Profile";
import Request from "../Request";
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
        if (!this._profiles.has(userId)) {
            throw new Error(`Профиля с id: ${userId} не существует.`);
        }

        return this._profiles.get(userId) as Profile;
    }

    // Добавление нового профиля пользователя
    public addProfile(userId: string = MY_ID): void {
        const newProfile = new Profile(userId, this._request, this._dispatch);

        this._profiles.set(userId, newProfile);
        this._bindListeners(newProfile);
    }

    // Удаление профиля пользователя
    public removeProfile(userId: string = MY_ID): void {
        if (!this._profiles.has(userId)) {
            throw new Error(`Профиля с id: ${userId} не существует.`);
        }

        this._profiles.delete(userId);
    }

    // Слушатель события класса Profile
    private _bindListeners(profile: Profile) {
        profile.on("get-me", () => this.emit("get-me"));
    }
}