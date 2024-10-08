import EventEmitter from "eventemitter3";

import Request from "../Request";
import { setImagesInCarousel, setLoading } from "../../state/main/slice";
import { addPhotos, changeUserField, deletePhoto, setPhotos, setPhotosCount, setUser, setUserDetail } from "../../state/user/slice";
import { setFriendsCount, setSubscribersCount, setTopFriends } from "../../state/friends/slice";
import { ApiRoutes } from "../../types/enums";
import { IPhoto, IUser, IUserDetails } from "../../types/models.types";
import { AppDispatch } from "../../types/redux.types";
import { MainClientEvents } from "../../types/events";
import { MY_ID, NO_PHOTO } from "../../utils/constants";
import { currentDate } from "../../utils/datetime";
import { AVATAR_URL } from "../../utils/files";
import { getFullName } from "../../utils";

// Класс, отвечающий за полный объект пользователя
export default class Profile extends EventEmitter {
    private _user!: IUser;

    constructor(private readonly _userId: string, private readonly _request: Request, private readonly _dispatch: AppDispatch) {
        super();

        if (this._userId === MY_ID) {
            this._getMe();
        } else {
            this._getUser();
        }
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

    // Получение объекта пользователя (себя)
    private _getMe() {
        this._request.get({
            route: ApiRoutes.getUser,
            setLoading: (loading: boolean) => this._dispatch(setLoading(loading)),
            successCb: (data: { success: boolean, user: IUser }) => {
                this._user = data.user;
                this._dispatch(setUser(this._user));
                console.log("Подгрузили инфу о себе: ", this._user);
                this.emit(MainClientEvents.GET_ME);
            }
        });
    }

    // Получение объекта другого пользователя при переходе на его страницу
    private _getUser() {

    }

    // Обновление объекта пользователя в классе Profile и в сторе
    private _changeField(field: string, value: string) {
        this._user = {
            ...this._user,
            [field]: value
        }
        this._dispatch(changeUserField({ field, value }));
    }

    //-------------------------------------------------
    // Методы главной фотографии (аватара)
    //-------------------------------------------------

    // Клик по аватару
    public onClickAvatar(): void {
        this._dispatch(setImagesInCarousel({
            images: [{
                src: this.avatarUrl,
                alt: this.fullName,
                authorName: this.fullName,
                dateTime: "",
                authorAvatarUrl: this.avatarUrl
            }],
            index: 0
        }));
    }

    // Удаление аватара
    public onDeleteAvatar() {
        this._request.post({
            route: ApiRoutes.deleteImage,
            data: { fileUrl: this.avatarUrl },
            successCb: () => this._dispatch(changeUserField({ field: AVATAR_URL, value: "" }))
        });
    }

    // Установка/обновление аватара
    public onSetAvatar({ id, newAvatarUrl, newPhotoUrl }: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) {
        this._changeField(AVATAR_URL, newAvatarUrl);
        this._dispatch(addPhotos([{ 
            id, 
            userId: this.id, 
            path: newPhotoUrl, 
            createDate: currentDate, 
            User: { 
                id: this.id,
                firstName: this._user.firstName,
                thirdName: this._user.thirdName,
                avatarUrl: newAvatarUrl
            } 
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
                    const deletedPhoto = photos.find(photo => photo.path === path && photo.userId === this.id);

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