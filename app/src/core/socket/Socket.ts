import EventEmitter from "eventemitter3";
import { io } from "socket.io-client";

import { SOCKET_IO_CLIENT } from "../../utils/constants";
import { AppDispatch } from "../../types/redux.types";
import { SocketType } from "../../types/socket.types";
import { MainClientEvents, SocketEvents } from "../../types/events";
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
        this._socket = io(SOCKET_IO_CLIENT, { 
            transports: ["websocket"],
            autoConnect: false,             // Отключаем автоподключение
            reconnection: true              // Включаем восстановление соединения
        });
        this._dispatch = dispatch;
    }

    // TODO Удалить после рефакторинга звонков (useWebRTC)
    get socket() {
        return this._socket;
    }

    init() {
        if (!this._user) {
            this.emit(MainClientEvents.ERROR, "Объект пользователя не существует");
            return;
        }

        this._connect();

        this._socketController = new SocketController({ socket: this._socket, user: this._user, dispatch: this._dispatch });

        this._bindSocketControllerListeners();
    }

    disconnect() {
        this._socket.disconnect();
    }

    _connect() {
        this._socket.auth = { userId: this._user.id };
        this._socket.connect();
    }

    private _bindSocketControllerListeners() {
        this._socketController.on(MainClientEvents.REDIRECT, (path: string) => {
            this.emit(MainClientEvents.REDIRECT, path);
        });

        this._socketController.on(SocketEvents.RECONNECT, () => {
            this._connect();
        });
    }
}
