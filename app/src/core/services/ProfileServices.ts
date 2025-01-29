import EventEmitter from "eventemitter3";

import Logger from "@service/Logger";
import Request from "@core/Request";
import UserService from "@core/services/UserService";
import { Profile } from "@core/models/Profile";
import { User } from "@core/models/User";
import { addPhotos, deletePhoto, setPhotos, setPhotosCount } from "@store/user/slice";
import { setFriendsCount, setSubscribersCount, setTopFriends } from "@store/friend/slice";
import { ApiRoutes } from "@custom-types/enums";
import { IPhoto, IUser, IUserDetails } from "@custom-types/models.types";
import { AppDispatch } from "@custom-types/redux.types";
import { GlobalEvents, MainClientEvents, UserEvents, UserDetailsEvents, ProfileEvents } from "@custom-types/events";
import { AVATAR_URL } from "@utils/files";
import { getFullName } from "@utils/index";
import { currentDate } from "@utils/time";
import eventBus from "@utils/event-bus";
import { IFormValues } from "@pages/Edit";

const logger = Logger.init("Profile");

// Класс, являющийся полной сущностью пользователя на стороне клиента. Содержит все данные, относящиеся к пользователю согласно контракту "Профиль пользователя"
export default class ProfileService extends EventEmitter implements Profile {
    private readonly _user: User;

    constructor(private readonly _userId: string, private readonly _request: Request, private readonly _dispatch: AppDispatch) {
        super();

        logger.debug(`init profile for user [userId=${this._userId}]`);

        this._user = UserService.create(this._userId, this._request, this._dispatch);
        this._bindUserListeners();
    }

    get user(): User {
        return this._user;
    }

    private _bindUserListeners() {
        this._user.on(MainClientEvents.GET_ME, () => {
            logger.debug("MainClientEvents.GET_ME");
            this.emit(MainClientEvents.GET_ME);
        });
        this._user.on(UserEvents.CHANGE_FIELD, (field: string, value: string) => {
            logger.debug(`UserEvents.CHANGE_FIELD [field: ${field}, value: ${value}]`);
            this.emit(UserEvents.CHANGE_FIELD, field, value);
        });
    }

    //-------------------------------------------------
    // Методы главной фотографии (аватара)
    //-------------------------------------------------
    // Клик по аватару
    onClickAvatar() {
        logger.debug("onClickAvatar");

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
        logger.debug(`onSetAvatar [data=${{ id, newAvatarUrl, newPhotoUrl }}]`);

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
        logger.debug(`updatePhotosCount [${count}]`);
        this._dispatch(setPhotosCount(count));
    }

    // Клик по фотографии
    onClickPhoto(photos: IPhoto[], index: number) {
        logger.debug(`onClickPhoto [photos=${photos}, index=${index}]`);

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

    //-------------------------------------------------
    // Методы страницы редактирования
    //-------------------------------------------------
    // Редактирование
    editInfo(result: IFormValues) {
        this._request.post({
            route: ApiRoutes.editInfo,
            data: { ...result, userId: this._user.id },
            setLoading: (value: React.SetStateAction<boolean>) => {
                this.emit( UserDetailsEvents.SET_LOADING, value );
            },
            successCb:
                (data: { success: boolean; user: IUser; userDetails: IUserDetails; }) => {
                    if (data.success) {
                        this._user.updateInfo(data);
                        this.emit(ProfileEvents.SET_ALERT);
                    }
                },
        });

    }
}