import EventEmitter from "eventemitter3";

import Request from "../Request";
import User from "../models/User";
import { setImagesInCarousel } from "../../state/main/slice";
import { addPhotos, changeUserField, deletePhoto, setPhotos, setPhotosCount, setUserDetail } from "../../state/user/slice";
import { setFriendsCount, setSubscribersCount, setTopFriends } from "../../state/friends/slice";
import { ApiRoutes } from "../../types/enums";
import { IPhoto, IUser, IUserDetails } from "../../types/models.types";
import { AppDispatch } from "../../types/redux.types";
import { MainClientEvents } from "../../types/events";
import { NO_PHOTO } from "../../utils/constants";
import { currentDate } from "../../utils/datetime";
import { AVATAR_URL } from "../../utils/files";
import { getFullName } from "../../utils";

// Класс, отвечающий за полный объект пользователя
export default class Profile extends EventEmitter {
    private _user: User;

    constructor(private readonly _userId: string, private readonly _request: Request, private readonly _dispatch: AppDispatch) {
        super();

        this._user = User.create(this._userId, { request: this._request, dispatch: this._dispatch });
        this._bindUserListeners();
    }

    get user() {
        return this._user;
    }

    private _bindUserListeners() {
        this._user.on(MainClientEvents.GET_ME, () => this.emit(MainClientEvents.GET_ME));
    }

    //-------------------------------------------------
    // Методы главной фотографии (аватара)
    //-------------------------------------------------

    // Клик по аватару
    public onClickAvatar(): void {
        this._dispatch(setImagesInCarousel({
            images: [{
                src: this._user.avatarUrl,
                alt: this._user.fullName,
                authorName: this._user.fullName,
                dateTime: "",   // TODO https://tracker.yandex.ru/MESSANGER-22
                authorAvatarUrl: this._user.avatarUrl
            }],
            index: 0
        }));
    }

    // Удаление аватара
    public onDeleteAvatar() {
        this._request.post({
            route: ApiRoutes.deleteImage,
            data: { fileUrl: this._user.avatarUrl },
            successCb: () => this._dispatch(changeUserField({ field: AVATAR_URL, value: "" }))
        });
    }

    // Установка/обновление аватара
    public onSetAvatar({ id, newAvatarUrl, newPhotoUrl }: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) {
        this._user.changeField(AVATAR_URL, newAvatarUrl);
        this._dispatch(addPhotos([{ 
            id, 
            userId: this._user.id, 
            path: newPhotoUrl, 
            createDate: currentDate
        }]));
    }

    //-------------------------------------------------
    // Методы блока с фотографиями
    //-------------------------------------------------

    // Получить все фотографии
    public getAllPhotos(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
        this._request.get({
            route: ApiRoutes.getPhotos,
            setLoading,
            successCb: (data: { success: boolean; photos: IPhoto[]; }) => {
                this._dispatch(setPhotos(data.photos))
            }
        });
    }

    // Обновить количество фотографий
    public updatePhotosCount(count: number) {
        this._dispatch(setPhotosCount(count));
    }

    // Клик по фотографии
    public onClickPhoto(photos: IPhoto[], index: number) {
        if (photos && photos.length) {
            this._dispatch(setImagesInCarousel({
                images: photos.map(photo => ({ 
                    src: photo.path, 
                    alt: photo.id, 
                    authorName: getFullName(photo.User),
                    dateTime: photo.createDate,
                    authorAvatarUrl: photo.User?.avatarUrl || NO_PHOTO
                })),
                index
            }));
        }
    }

    // Добавление одной/нескольких фтографий
    public addPhotos(data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
        this._request.post({
            route: ApiRoutes.savePhotos,
            data,
            setLoading,
            successCb: (data: { success: boolean; photos: IPhoto[]; }) => {
                this._dispatch(addPhotos(data.photos));
            },
            config: { headers: { "Content-Type": "multipart/form-data" } }
        });
    }

    // Удаление фотографии
    public deletePhoto(data: Object, photos: IPhoto[], path: string) {
        this._request.post({
            route: ApiRoutes.deleteImage,
            data,
            successCb: () => {
                if (photos.length) {
                    const deletedPhoto = photos.find(photo => photo.path === path && photo.userId === this._user.id);

                    if (deletedPhoto) {
                        const indexOf = photos.indexOf(deletedPhoto);
        
                        this._dispatch(deletePhoto(indexOf));
                    }
                }
            }
        });
    }

    //-------------------------------------------------
    // Методы блока с основной информацией
    //-------------------------------------------------
    public getUserDetail(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
        this._request.get({
            route: ApiRoutes.getUserDetail, 
            setLoading,
            successCb: (data: { success: boolean, userDetail: IUserDetails }) => {
                this._dispatch(setUserDetail(data.userDetail))
            }
        });
    }

    //-------------------------------------------------
    // Методы блока с друзьями
    //-------------------------------------------------
    public getFriends(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
        this._request.get({
            route: ApiRoutes.getCountFriends, 
            setLoading,
            successCb: (data: { success: boolean, friendsCount: number, topFriends: IUser[] | null, subscribersCount: number; }) => {
                this._dispatch(setFriendsCount(data.friendsCount));
                this._dispatch(setSubscribersCount(data.subscribersCount));
                this._dispatch(setTopFriends(data.topFriends));
            }
        });
    }
}