import EventEmitter from "eventemitter3";
import { io } from "socket.io-client";

import SocketController from "./SocketController";
import { SOCKET_IO_CLIENT } from "../../utils/constants";
import { AppDispatch } from "../../types/redux.types";
import { SocketType } from "../../types/socket.types";
import { MainClientEvents, SocketEvents } from "../../types/events";
import { IUser } from "../../types/models.types";

// Класс, являющийся оберткой для socket.io-client, позволяющий давать запросы на сервер по протоколу ws через транспорт websocket
export default class Socket extends EventEmitter {
    private _socket!: SocketType;
    private _socketController!: SocketController;
    private _me!: IUser;

    constructor(private readonly _dispatch: AppDispatch) {
        super();
    }

    // TODO Удалить после рефакторинга звонков (useWebRTC)
    get socket() {
        return this._socket;
    }

    init(myUser: IUser) {
        if (!myUser) {
            this.emit(MainClientEvents.ERROR, "Объект пользователя не существует");
            return;
        }

        this._me = myUser;

        this._socket = io(SOCKET_IO_CLIENT, { 
            transports: ["websocket"],
            autoConnect: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 5000,
            forceNew: false,
            upgrade: true,
            closeOnBeforeunload: true,
            withCredentials: true,
        });
        this._socket.auth = { user: this._me };

        this._socketController = new SocketController({ socket: this._socket, myUser: this._me, dispatch: this._dispatch });

        this._bindSocketControllerListeners();
    }

    disconnect() {
        this._socket.disconnect();
    }

    _connect() {
        this._socket.auth = { user: this._me };
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
