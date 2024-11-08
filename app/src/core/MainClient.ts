import React from "react";
import EventEmitter from "eventemitter3";

import { setAuth, setFriendNotification, setMessageNotification } from "../state/main/slice";
import { ApiRoutes, Pages } from "../types/enums";
import { IUser } from "../types/models.types";
import { AppDispatch } from "../types/redux.types";
import { MainClientEvents } from "../types/events";
import CatchErrors, { CatchType } from "./CatchErrors";
import Request from "./Request";
import Socket from "./socket/Socket";
import ProfilesController from "./profile/ProfilesController";
import Profile from "./profile/Profile";
import { MY_ID } from "../utils/constants";

// TODO
// 1) Создать новый класс User и вынести все упоминания из Profile
// 2) Объединить методы _getMe и _getUser в профиле Profile
// 2.0) Создать единый компонент ссылки в проекте на основе MUI (проверить и заменить все <a> или <Link> на собственный компонент, добавив ему стили)
// 2.1) Подгрузить отдельно аватарку + создать и хранить ее отдельно в таблице Avatars + заменить поле avatarUrl в таблице Users (хранить там ссылку на id записи таблицы Avatars)
// 3) После работы с профилем: Отрефакторить фронт (заменить throw new Error/throw на catch из mainClient через eventemitter, вынести события eventemitter в отдельный енам)
// 4) После работы с профилем: Отрефакторить бек (перепроверить возврат данных, создать новый функции для каждого использования - например: отдельно создание/удаление фотки и аватара)
// 5) После работы с профилем: Отрефакторить БД (не должно быть ссылок на строки и тд, переделать и создать новые поля/таблицы при необходимости)
// 6) Описать документацию по отрисовке, профилю, аватарам и фотографиям

// 7) Доработка картинок (скрыть настоящий адрес картинки - вместо него отрисовывать блоб объект) - https://stackoverflow.com/questions/7650587/using-javascript-to-display-a-blob/27737668#27737668
// 8) Прыгает меню после открытия (Header.tsx) - Не решил - попробовать заменить Menu на Dropdown
// 9) Доработать и пробежатся по стилям страницы профиля (вынести отдельно css переменные/цвета)
// 10) Реализовать редактирование доп. информации в профиле
// 11) Реализовать прослойку для вызова апи функций на фронте (что не поместиться в контроллеры), например, mainClient.api.METHOD
// 12) Подумать, может быть стоит создать класс для Friend - в нем хранить всю инфу о нем (например друг нам или нет) + создать FriendsController
// 13) Друзья онлайн - добавить условие, что они должны подгружаться только если они в друзьях!
// 14) Зачем pushLeft в Common/Avatar.tsx (во время реализации друзей)

// ..) Сделать переподключение редиса при ошибке подключения (учесть redisStore)
// ..) Найти способ сжать файлы (именно уменьшить размер) при сохранении локально на сервер и в БД + проверить всю работу
// ..) Типизировать все dataValues в контоллерах (https://sequelize.org/docs/v6/core-concepts/raw-queries/)
// ..) Реализовать сборщик мусора файлов/картинок на сервере (проходить раз в день - возможно при запуске сервера, если файл/картинка в БД не юзается - удалять его)

export default class MainClient extends EventEmitter {
    private readonly _request: Request;
    private readonly _catchErrors: CatchErrors;
    private readonly _profilesController: ProfilesController;
    private _socket!: Socket;

    constructor(private readonly _dispatch: AppDispatch) {
        super();

        this._catchErrors = new CatchErrors(this._dispatch);
        this._request = new Request(this._catchErrors);

        this._profilesController = new ProfilesController(this._request, this._dispatch);

        this._bindProfileListeners();
        this._bindCatchErrorsListeners();
    }

    public catchErrors(error: string) {
        this._catchErrors.catch(error);
    }

    // TODO Удалить после рефакторинга звонков (useWebRTC)
    public getSocket() {
        if (!this._socket) {
            this._initSocket();
        }

        return this._socket?.getSocketInstance();
    }

    public getProfile(userId: string = MY_ID): Profile {
        return this._profilesController.getProfile(userId);
    }

    public signIn(data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>, cb: (error: CatchType) => void) {
        this._request.post({
            route: ApiRoutes.signIn,
            data,
            setLoading,
            successCb: () => {
                this._profilesController.addProfile();
                this.emit(MainClientEvents.REDIRECT, Pages.profile);
            },
            failedCb: cb
        });
    }

    public signUp(data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>, cb: (error: CatchType) => void) {
        this._request.post({
            route: ApiRoutes.signUp,
            data,
            setLoading,
            successCb: (data: { success: boolean, user: IUser }) => {
                // TODO исправить пиздец (пункт 2.1)
                this._uploadAvatar({ avatarUrl: data.user.avatarUrl });
            },
            failedCb: cb
        });
    }

    public logout() {
        this.emit(MainClientEvents.REDIRECT, Pages.signIn);
        this._dispatch(setAuth(false));
        this._socket.disconnect();

        this._request.get({
            route: ApiRoutes.logout,
            successCb: () => {
                // Сделано в обработчике специально, так как нужно дождаться размонтирования компонент на странице профиля (они используют текущий профиль)
                this._profilesController.removeProfile();
            }
        });
    }

    public uploadAvatarAuth(route: ApiRoutes, data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>, cb: (data: { success: boolean; id: string; newAvatarUrl: string; newPhotoUrl: string; }) => void) {
        this._request.post({
            route,
            data,
            setLoading,
            successCb: cb,
            config: { headers: { "Content-Type": "multipart/form-data" } }
        });
    }

    public getFriendsNotification() {
        this._request.get({
            route: ApiRoutes.getFriendsNotification,
            successCb: (data: { success: boolean, friendRequests: number }) => this._dispatch(setFriendNotification(data.friendRequests))
        });
    }

    public getMessageNotification() {
        this._request.get({
            route: ApiRoutes.getMessageNotification,
            successCb: (data: { success: boolean, unreadChatsCount: number; }) => this._dispatch(setMessageNotification(data.unreadChatsCount))
        });
    }

    public getAttachments(data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>, cb: (data: any) => void) {
        this._request.post({
            route: ApiRoutes.getAttachments,
            data,
            setLoading,
            failedCb: cb
        });
    }

    public openFile(data: Object) {
        this._request.post({ route: ApiRoutes.openFile, data });
    }

    private _uploadAvatar(data: Object) {
        this._request.post({
            route: ApiRoutes.uploadAvatar,
            data,
            successCb: () => {
                this._profilesController.addProfile();
                this.emit(MainClientEvents.REDIRECT, Pages.profile)
            }
        });
    }

    // Слушатели событый класса ProfilesController
    private _bindProfileListeners() {
        this._profilesController.on(MainClientEvents.GET_ME, () => {
            this._getMe();
        });

        this._profilesController.on(MainClientEvents.ERROR, (error: string) => {
            this.catchErrors(error);
        });
    }

    // Слушатели событый класса CatchErrors
    private _bindCatchErrorsListeners() {
        this._catchErrors.on(MainClientEvents.REDIRECT, (path: string) => {
            this.emit(MainClientEvents.REDIRECT, path);
        });
    }

    // Слушатели событый класса Socket
    private _bindSocketListeners() {
        this._socket.on(MainClientEvents.REDIRECT, (path: string) => {
            this.emit(MainClientEvents.REDIRECT, path);
        });

        this._socket.on(MainClientEvents.ERROR, (error: string) => {
            this.catchErrors(error);
        });
    }

    // Получили информацию о себе
    private _getMe() {
        this._dispatch(setAuth(true));
        this._initSocket();
        this._redirectHandler();
    }

    // Инициализация сокета
    private _initSocket() {
        if (!this._socket) {
            this._socket = new Socket({
                myProfile: this.getProfile(),
                dispatch: this._dispatch
            });

            this._bindSocketListeners();
        }
    }

    // Редирект в зависимости от текущего урла
    private _redirectHandler() {
        switch (window.location.pathname) {
            case Pages.main:
            case Pages.signIn:
            case Pages.signUp:
                this.emit(MainClientEvents.REDIRECT, Pages.profile);
                break;
        }
    }
}