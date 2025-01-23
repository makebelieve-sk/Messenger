import EventEmitter from "eventemitter3";

import Request from "@core/Request";
import UserService from "@core/services/UserService";
import { Profile } from "@core/models/Profile";
import { User } from "@core/models/User";
import { addPhotos, deletePhoto, setPhotos, setPhotosCount } from "@store/user/slice";
import { setFriendsCount, setSubscribersCount, setTopFriends } from "@store/friend/slice";
import { ApiRoutes } from "@custom-types/enums";
import { IPhoto, IUser, IUserDetails } from "@custom-types/models.types";
import { AppDispatch } from "@custom-types/redux.types";
import { GlobalEvents, MainClientEvents, UserEvents } from "@custom-types/events";
import { currentDate } from "@utils/time";
import { AVATAR_URL } from "@utils/files";
import { getFullName } from "@utils/index";
import eventBus from "@utils/event-bus";

// Класс, являющийся полной сущностью пользователя на стороне клиента. Содержит все данные, относящиеся к пользователю согласно контракту "Профиль пользователя"
export default class ProfileService extends EventEmitter implements Profile {
    private readonly _user: User;

    constructor(private readonly _userId: string, private readonly _request: Request, private readonly _dispatch: AppDispatch) {
        super();

        this._user = UserService.create(this._userId, this._dispatch, this._request);
        this._bindUserListeners();
    }

    get user(): User {
        return this._user;
    }

    private _bindUserListeners() {
        this._user.on(MainClientEvents.GET_ME, () => this.emit(MainClientEvents.GET_ME));
        this._user.on(UserEvents.CHANGE_FIELD, (...args: string[]) => this.emit(UserEvents.CHANGE_FIELD, ...args));
    }

    //-------------------------------------------------
    // Методы главной фотографии (аватара)
    //-------------------------------------------------
    // Клик по аватару
    onClickAvatar() {
        if (this._user.avatarUrl) {
            eventBus.emit(GlobalEvents.SET_IMAGES_CAROUSEL, {
                images: [{
                    src: this._user.avatarUrl,
                    alt: this._user.fullName,
                    authorName: this._user.fullName,
                    dateTime: "",   // TODO https://tracker.yandex.ru/MESSANGER-22
                    authorAvatarUrl: this._user.avatarUrl
                }],
                index: 0
            });
        }
    }

    // Удаление аватара
    onDeleteAvatar(setLoading?: React.Dispatch<React.SetStateAction<boolean>>) {
        this._request.post({
            route: ApiRoutes.deletePhoto,
            data: { imageUrl: this._user.avatarUrl },
            setLoading,
            successCb: () => {
                this._user.changeField(AVATAR_URL, "");
            }
        });
    }

    // Установка/обновление аватара
    onSetAvatar({ id, newAvatarUrl, newPhotoUrl }: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) {
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
    getAllPhotos(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
        this._request.get({
            route: ApiRoutes.getPhotos,
            setLoading,
            successCb: (data: { success: boolean; photos: IPhoto[]; }) => {
                this._dispatch(setPhotos(data.photos))
            }
        });
    }

    // Обновить количество фотографий
    updatePhotosCount(count: number) {
        this._dispatch(setPhotosCount(count));
    }

    // Клик по фотографии
    onClickPhoto(photos: IPhoto[], index: number) {
        if (photos && photos.length) {
            eventBus.emit(GlobalEvents.SET_IMAGES_CAROUSEL, {
                images: photos.map(photo => ({ 
                    src: photo.path, 
                    alt: photo.id, 
                    authorName: getFullName(photo.User),
                    dateTime: photo.createDate,
                    authorAvatarUrl: photo.User?.avatarUrl || ""
                })),
                index
            });
        }
    }

    // Добавление одной/нескольких фтографий
    addPhotos(data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
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
    deletePhoto(data: Object, photos: IPhoto[], path: string) {
        this._request.post({
            route: ApiRoutes.deletePhoto,
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
    // Получение дополнительной информации о пользователе
    getUserDetail(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
        this._request.get({
            route: ApiRoutes.getUserDetail, 
            setLoading,
            successCb: (data: { success: boolean; userDetail: IUserDetails; }) => {
                this._user.setUserDetails(data.userDetail);
            }
        });
    }

    //-------------------------------------------------
    // Методы блока с друзьями
    //-------------------------------------------------
    // Получение друзей топ-6
    getFriends(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
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