import { io } from "socket.io-client";
import { NavigateFunction } from "react-router-dom";

import { SOCKET_IO_CLIENT } from "../../utils/constants";
import { AppDispatch, StoreType } from "../../types/redux.types";
import { SocketType } from "../../types/socket.types";
import { IUser } from "../../types/models.types";
import SocketController from "./SocketController";
import Profile from "../profile/Profile";

interface IConstructor {
    myProfile: Profile;
    navigate: NavigateFunction;
    dispatch: AppDispatch;
};

export default class Socket {
    private readonly _socket: SocketType;
    private readonly _user: IUser;
    private readonly _navigate: NavigateFunction;
    private readonly _dispatch: AppDispatch;

    constructor({ myProfile, navigate, dispatch }: IConstructor) {
        this._user = myProfile.user;
        this._socket = io(SOCKET_IO_CLIENT, { transports: ["websocket"] });
        this._navigate = navigate;
        this._dispatch = dispatch;

        this._init();
    }

    // TODO Удалить после рефакторинга звонков (useWebRTC)
    public getSocketInstance() {
        return this._socket;
    }

    private _init() {
        if (!this._user) {
            throw new Error("Объект пользователя не существует");
        }

        this._socket.auth = { user: this._user };
        this._socket.connect();

        new SocketController({ socket: this._socket, user: this._user, dispatch: this._dispatch, navigate: this._navigate });
    }

    public disconnect() {
        this._socket.disconnect();
    }
}
