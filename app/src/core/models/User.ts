import EventEmitter from "eventemitter3";

import Request from "../Request";
import UserDetails from "./UserDetails";
import { MY_ID, NO_PHOTO } from "../../utils/constants";
import { IUser, IUserDetails } from "../../types/models.types";
import { AppDispatch } from "../../types/redux.types";
import { ApiRoutes } from "../../types/enums";
import { MainClientEvents, UserEvents } from "../../types/events";
import { setLoading } from "../../store/main/slice";

// Класс, описывающий сущность "Пользователь"
export default class User extends EventEmitter {
    private readonly _userDetails: UserDetails;
    private _user!: IUser;

    constructor(private readonly _id: string, private readonly _dispatch: AppDispatch, private readonly _request: Request) {
        super();

        this._id === MY_ID
            ? this._getMe()
            : this._getUser();

        this._userDetails = new UserDetails();
    }

    get id(): string {
        return this._user.id;
    }

    get user(): IUser {
        return this._user;
    }

    get fullName(): string {
        return this._user.firstName + " " + this._user.thirdName;
    }

    get avatarUrl(): string {
        return this._user.avatarUrl ? this._user.avatarUrl : NO_PHOTO;
    }

    get userDetails(): UserDetails {
        return this._userDetails;
    }

    // Получение данных о себе
    private _getMe() {
        this._request.get({
            route: ApiRoutes.getMe,
            setLoading: (loading: boolean) => this._dispatch(setLoading(loading)),
            successCb: (data: { user: IUser }) => {
                this._user = data.user;
                console.log("Подгрузили инфу о себе: ", this._user);
                this.emit(MainClientEvents.GET_ME);
            }
        });
    }

    // Получение данных другого пользователя
    private _getUser() {
        this._request.post({
            route: ApiRoutes.getUser,
            data: { id: this._id },
            successCb: (data: { user: IUser }) => {
                // this._user = data.user;
                console.log("Подгрузили инфу о другом пользователе: ", data.user);
            }
        });
    }

    // Обновление данных о себе (так как после входа уже существует в мапе мой профиль и сущность Пользователь)
    updateMe() {
        this._getMe();
    }

    // Замена поля пользователя и обновление в глобальном состоянии
    changeField(field: string, value: string) {
        this._user[field] = value;
        this.emit(UserEvents.CHANGE_FIELD, field, value);
    }

    // Обновление дополнительной информации о пользователе
    setUserDetails(userDetails: IUserDetails) {
        this._userDetails.setDetails(userDetails);
    }

    /**
     * Статичный метод фабрика
     * Возвращает сущность "Пользователь"
     */
    static create(...args: [string, AppDispatch, Request]) {
        return new User(...args);
    }
}