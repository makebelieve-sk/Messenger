import { io } from "socket.io-client";
import { NavigateFunction } from "react-router-dom";

import { SOCKET_IO_CLIENT } from "../../utils/constants";
import { AppDispatch, RootState, StoreType } from "../../types/redux.types";
import { SocketType } from "../../types/socket.types";
import { IUser } from "../../types/models.types";
import SocketController from "./SocketController";

interface IConstructor {
    store: StoreType;
    navigate: NavigateFunction;
    dispatch: AppDispatch;
};

export default class Socket {
    private _store: StoreType;
    private _socket: SocketType;
    private _user: IUser;
    private _navigate: AppDispatch;
    private _dispatch: AppDispatch;

    constructor({ store, navigate, dispatch }: IConstructor) {
        this._store = store;
        this._user = (this._store.getState() as RootState).users.user;
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
        this._socket.auth = { user: this._user };
        this._socket.connect();

        new SocketController({ socket: this._socket, user: this._user, dispatch: this._dispatch, navigate: this._navigate });
    }

    public disconnect() {
        this._socket.disconnect();
    }
}
