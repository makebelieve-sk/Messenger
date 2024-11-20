import EventEmitter from "eventemitter3";

import Socket from "./socket/Socket";
import Request from "./Request";
import ProfilesController from "./profile/ProfilesController";
import { CatchType } from "./CatchErrors";
import { IUser } from "../types/models.types";
import { ApiRoutes, Pages } from "../types/enums";
import { MainClientEvents } from "../types/events";
import { AppDispatch } from "../types/redux.types";
import { setAuth, setFriendNotification, setMessageNotification } from "../state/main/slice";

export default class MainApi extends EventEmitter {
    constructor(
        private readonly _request: Request, 
        private readonly _socket: Socket, 
        private readonly _dispatch: AppDispatch, 
        private readonly _profilesController: ProfilesController
    ) {
        super();
    }

    signIn(data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>, cb: (error: CatchType) => void) {
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

    signUp(data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>, cb: (error: CatchType) => void) {
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

    logout() {
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

    uploadAvatarAuth(
        route: ApiRoutes, 
        data: Object, 
        setLoading: React.Dispatch<React.SetStateAction<boolean>>, 
        cb: (data: { success: boolean; id: string; newAvatarUrl: string; newPhotoUrl: string; }) => void
    ) {
        this._request.post({
            route,
            data,
            setLoading,
            successCb: cb,
            config: { headers: { "Content-Type": "multipart/form-data" } }
        });
    }

    getFriendsNotification() {
        this._request.get({
            route: ApiRoutes.getFriendsNotification,
            successCb: (data: { success: boolean, friendRequests: number }) => this._dispatch(setFriendNotification(data.friendRequests))
        });
    }

    getMessageNotification() {
        this._request.get({
            route: ApiRoutes.getMessageNotification,
            successCb: (data: { success: boolean, unreadChatsCount: number; }) => this._dispatch(setMessageNotification(data.unreadChatsCount))
        });
    }

    getAttachments(data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>, cb: (data: any) => void) {
        this._request.post({
            route: ApiRoutes.getAttachments,
            data,
            setLoading,
            failedCb: cb
        });
    }

    openFile(data: Object) {
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
}