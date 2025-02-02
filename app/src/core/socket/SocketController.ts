import EventEmitter from "eventemitter3";

import UsersController from "@core/socket/controllers/Users";
import FriendsController from "@core/socket/controllers/Friends";
import MessangesController from "@core/socket/controllers/Messages";
import Logger from "@service/Logger";
import i18next from "@service/i18n";
import PlayAudio from "@utils/play-audio";
import { setSystemError } from "@store/error/slice";
import { setOnlineUsers } from "@store/main/slice";
import { setMessage } from "@store/message/slice";
import { Pages, SocketActions } from "@custom-types/enums";
import { IMessage, IUser } from "@custom-types/models.types";
import { AppDispatch } from "@custom-types/redux.types";
import { SocketType } from "@custom-types/socket.types";
import { SocketEvents } from "@custom-types/events";

const logger = Logger.init("SocketController");
const SERVER_DISCONNECT = "io server disconnect";

// Главный контроллер по управлению всеми событиями сокет соединения, при этом, обрабатывая системные события
export default class SocketController extends EventEmitter {
    private readonly _usersController: UsersController;
    private readonly _messagesController: MessangesController;

    constructor(private readonly _socket: SocketType, private readonly _dispatch: AppDispatch, private readonly _myUser: IUser) {
        super();

        this._init();

        this._usersController = new UsersController(this._socket, this._dispatch);
        new FriendsController(this._socket, this._dispatch);
        this._messagesController = new MessangesController(this._socket, this._dispatch);

        this._bindListeners();
    }

    private _init() {
        this._socket.on("connect", () => {
            logger.info(i18next.t("core.socket.connection_established", { socketId: this._socket.id }));
        });

        // Обработка системного канала с ошибками
        this._socket.on(SocketActions.SOCKET_CHANNEL_ERROR, (message) => {
            // Вывод ошибки
            this._dispatch(setSystemError(message));
        });

        // Событие возникает при невозможности установить соединение или соединение было отклонено сервером (к примеру мидлваром)
        this._socket.on("connect_error", (error: Error) => {
            const isSocketActive = this._socket.active;

            logger.error(i18next.t("core.socket.error.connection", { isSocketActive: isSocketActive, message: error.message }));

            // Означает, что соединение было отклонено сервером
            if (!isSocketActive) {
                this.emit(SocketEvents.RECONNECT);
            }

            // Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
        });

        this._socket.on("disconnect", (reason) => {
            logger.debug("disconnect");

            const isSocketActive = this._socket.active;

            // Если сокет отключился по инициативе сервера, то перезапускаем сокет
            if (!isSocketActive && reason === SERVER_DISCONNECT) {
                this.emit(SocketEvents.RECONNECT);
            }

            // Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
        });
    }

    private _bindListeners() {
        this._usersController.on(SocketEvents.SET_ONLINE_USER, (onlineUser: IUser) => {
            if (onlineUser && onlineUser.id !== this._myUser.id) {
                this._dispatch(setOnlineUsers(onlineUser));
            }
        });

        this._messagesController.on(SocketEvents.ADD_MESSAGE, (message: IMessage) => {
            if (window.location.pathname.toLowerCase() === Pages.messages + "/" + message.chatId.toLowerCase()) {
                this._dispatch(setMessage({ message, showUnreadDie: true, userId: this._myUser.id }));
            } else {
                // Проигрываем аудио при получении нового сообщения
                const playAudio = new PlayAudio("/assets/audios/new-message-notification.mp3", this._dispatch, true, message.chatId);
                playAudio.init();
            }
        });
    }
}