import EventEmitter from "eventemitter3";

import Request from "../Request";
import UserDetails from "./UserDetails";
import { MY_ID, NO_PHOTO } from "../../utils/constants";
import { IUser, IUserDetails } from "../../types/models.types";
import { ApiRoutes } from "../../types/enums";
import { MainClientEvents, UserEvents } from "../../types/events";

// Класс, описывающий сущность "Пользователь"
export default class User extends EventEmitter {
    private readonly _userDetails: UserDetails;
    private _user!: IUser;
    // private _userDetails: UserDetails;
    constructor(private readonly _id: string, private readonly request: Request,) {
        super();

        this._id === MY_ID
            ? this._getMe()
            : this._getUser();

        this._userDetails = new UserDetails(this.request)
    }

    get id(): string {
        return this._user.id;
    }

    get user(): IUser {
        return this._user;
    }

    get firstName(): string {
        return this._user.firstName;
    }

    get thirdName(): string {
        return this._user.thirdName;
    }

    get phone(): string {
        return this._user.phone;
    }

    get email(): string {
        return this._user.email;
    }

    get fullName(): string {
        return this.firstName + " " + this.thirdName;
    }

    get userDetails(): UserDetails {
        return this._userDetails
    }

    get avatarUrl(): string {
        return this._user.avatarUrl ? this._user.avatarUrl : NO_PHOTO;
    }

    // Получение данных о себе
    private _getMe() {
        this.request.get({
            route: ApiRoutes.getMe,
            setLoading: (isLoading: boolean) => {
                this.emit(UserEvents.SET_LOADING, isLoading);
            },
            successCb: (data: { user: IUser }) => {
                this._user = data.user;
                console.log("Подгрузили инфу о себе: ", this._user);
                this.emit(MainClientEvents.GET_ME);
            }
        });
    }

    // Получение данных другого пользователя
    private _getUser() {
        this.request.post({
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

    // Обновление данных о пользователе при редактировании
    updateInfo({ user, userDetails }: { user: IUser, userDetails: IUserDetails }) {
        this._user = user;
        this._userDetails.updateDetails(userDetails);
    }

    /**
     * Статичный метод фабрика
     * Возвращает сущность "Пользователь"
     */
    static create(...args: [string, Request]) {
        return new User(...args);
    }
} 