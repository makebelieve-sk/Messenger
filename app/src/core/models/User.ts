import EventEmitter from "eventemitter3";

import Request from "../Request";
import { MY_ID, NO_PHOTO } from "../../utils/constants";
import { IUser } from "../../types/models.types";
import { AppDispatch } from "../../types/redux.types";
import { ApiRoutes } from "../../types/enums";
import { setLoading } from "../../state/main/slice";
import { changeUserField, setUser } from "../../state/user/slice";
import { MainClientEvents } from "../../types/events";

interface IOptions {
    request: Request;
    dispatch: AppDispatch;
};

export default class User extends EventEmitter {
    private _user!: IUser;

    constructor(private readonly _id: string, private readonly _options: IOptions) {
        super();

        this._id === MY_ID
            ? this._getMe()
            : this._getUser();
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

    // Получение данных о себе
    private _getMe() {
        this._options.request.get({
            route: ApiRoutes.getMe,
            setLoading: (loading: boolean) => this._options.dispatch(setLoading(loading)),
            successCb: (data: { user: IUser }) => {
                this._user = data.user;
                this._options.dispatch(setUser(this._user));
                console.log("Подгрузили инфу о себе: ", this._user);
                this.emit(MainClientEvents.GET_ME);
            }
        });
    }

    // Получение данных другого пользователя
    private _getUser() {
        this._options.request.post({
            route: ApiRoutes.getUser,
            data: { id: this._id },
            successCb: (data: { user: IUser }) => {
                // this._user = data.user;
                console.log("Подгрузили инфу о другом пользователе: ", data.user);
            }
        });
    }

    // Замена поля пользователя и обновление в глобальном состоянии
    changeField(field: string, value: string) {
        this._user = {
            ...this._user,
            [field]: value
        };
        this._options.dispatch(changeUserField({ field, value }));
    }

    /**
     * Статичный метод фабрика
     * Возвращает сущность "Пользователь"
     */
    static create(userId: string = MY_ID, options: IOptions) {
        return new User(userId, options);
    }
}