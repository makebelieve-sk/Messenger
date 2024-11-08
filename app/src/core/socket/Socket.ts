import EventEmitter from "eventemitter3";
import { io } from "socket.io-client";

import { SOCKET_IO_CLIENT } from "../../utils/constants";
import { AppDispatch } from "../../types/redux.types";
import { SocketType } from "../../types/socket.types";
import { MainClientEvents } from "../../types/events";
import SocketController from "./SocketController";
import Profile from "../profile/Profile";
import User from "../models/User";

interface IConstructor {
    myProfile: Profile;
    dispatch: AppDispatch;
};

export default class Socket extends EventEmitter {
    private readonly _socket: SocketType;
    private readonly _user: User;
    private readonly _dispatch: AppDispatch;
    private _socketController!: SocketController;

    constructor({ myProfile, dispatch }: IConstructor) {
        super();

        this._user = myProfile.user;
        this._socket = io(SOCKET_IO_CLIENT, { transports: ["websocket"] });
        this._dispatch = dispatch;

        this._init();
        this._bindSocketControllerListeners();
    }

    // TODO Удалить после рефакторинга звонков (useWebRTC)
    public getSocketInstance() {
        return this._socket;
    }

    private _init() {
        if (!this._user) {
            this.emit(MainClientEvents.ERROR, "Объект пользователя не существует");
            return;
        }

        this._socket.auth = { user: this._user.user };
        this._socket.connect();

        this._socketController = new SocketController({ socket: this._socket, user: this._user, dispatch: this._dispatch });
    }

    private _bindSocketControllerListeners() {
        this._socketController.on(MainClientEvents.REDIRECT, (path: string) => {
            this.emit(MainClientEvents.REDIRECT, path);
        });
    }

    public disconnect() {
        this._socket.disconnect();
    }
}
