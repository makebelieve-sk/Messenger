import EventEmitter from "eventemitter3";

import Request from "@core/Request";
import { CatchType } from "@core/CatchErrors";
import { IUser } from "@custom-types/models.types";
import { ApiRoutes } from "@custom-types/enums";
import { MainClientEvents } from "@custom-types/events";
import { AppDispatch } from "@custom-types/redux.types";
import { setFriendNotification, setMessageNotification } from "@store/main/slice";

// Класс, содержит все HTTP запросы, которые являются глобальными по отношению к приложению
export default class MainApi extends EventEmitter {
    constructor(
        private readonly _request: Request,
        private readonly _dispatch: AppDispatch
    ) {
        super();
    }

    signIn(data: Object, setLoading: React.Dispatch<React.SetStateAction<boolean>>, cb: (error: CatchType) => void) {
        this._request.post({
            route: ApiRoutes.signIn,
            data,
            setLoading,
            successCb: () => this.emit(MainClientEvents.SIGN_IN),
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
        this._request.get({
            route: ApiRoutes.logout,
            successCb: () => this.emit(MainClientEvents.LOG_OUT)
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
            route: ApiRoutes.saveAvatar,
            data,
            successCb: () => this.emit(MainClientEvents.SIGN_IN)
        });
    }
}