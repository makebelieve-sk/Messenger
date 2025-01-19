import EventEmitter from "eventemitter3";

import Request from "@core/Request";
import UserDetailsService from "@core/services/UserDetailsService";
import { User } from "@core/models/User";
import { UserDetails } from "@core/models/UserDetails";
import { MY_ID } from "@utils/constants";
import { IUser, IUserDetails } from "@custom-types/models.types";
import { AppDispatch } from "@custom-types/redux.types";
import { ApiRoutes } from "@custom-types/enums";
import { MainClientEvents, UserEvents } from "@custom-types/events";
import { setLoading } from "@store/main/slice";

// Класс, реализовывающий сущность "Пользователь" согласно контракту "Пользователь"
export default class UserService extends EventEmitter implements User {
    private readonly _userDetails: UserDetails;
    private _user!: IUser;

    constructor(private readonly _id: string, private readonly _dispatch: AppDispatch, private readonly _request: Request) {
        super();

        this._id === MY_ID
            ? this._getMe()
            : this._getUser();

        this._userDetails = new UserDetailsService();
    }

    get id() {
        return this._user.id;
    }

    get user() {
        return this._user;
    }

    get fullName() {
        return this._user.firstName + " " + this._user.thirdName;
    }

    get avatarUrl() {
        return this._user.avatarUrl ? this._user.avatarUrl : "";
    }

    get userDetails() {
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
        return new UserService(...args);
    }
}