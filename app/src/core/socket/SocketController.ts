import EventEmitter from "eventemitter3";

import UsersController from "@core/socket/controllers/Users";
import FriendsController from "@core/socket/controllers/Friends";
import MessangesController from "@core/socket/controllers/Messages";
import { ValidateHandleReturnType } from "@core/socket/validation";
import Logger from "@service/Logger";
import i18next from "@service/i18n";
import PlayAudio from "@utils/play-audio";
import { setSystemError } from "@store/error/slice";
import { setOnlineUsers } from "@store/main/slice";
import { setMessage } from "@store/message/slice";
import { Pages, SocketActions } from "@custom-types/enums";
import { IMessage, IUser } from "@custom-types/models.types";
import { AppDispatch } from "@custom-types/redux.types";
import { CallbackAckType, SocketType } from "@custom-types/socket.types";
import { MainClientEvents, SocketEvents } from "@custom-types/events";
import { SOCKET_MIDDLEWARE_ERROR } from "@utils/index";

const logger = Logger.init("SocketController");
const SERVER_DISCONNECT = "io server disconnect";

// Главный контроллер по управлению всеми событиями сокет соединения, при этом, обрабатывая системные события
export default class SocketController extends EventEmitter {
    private readonly _usersController: UsersController;
    private readonly _friendsController: FriendsController;
    private readonly _messagesController: MessangesController;

    constructor(private readonly _socket: SocketType, private readonly _dispatch: AppDispatch, private readonly _myId: string) {
        super();

        this._init();
        this._socketManagerListeners();

        this._usersController = new UsersController(this._socket, this._dispatch);
        this._friendsController = new FriendsController(this._socket, this._dispatch);
        this._messagesController = new MessangesController(this._socket, this._dispatch);

        this._bindListeners();
    }

    private _init() {
        this._socket.on("connect", () => {
            this._socket.recovered
                ? logger.info(i18next.t("core.socket.connection_successfully_recovered", { socketId: this._socket.id }))
                : logger.info(i18next.t("core.socket.connection_established", { socketId: this._socket.id }));
        });

        // Обработка системного канала с ошибками
        this._socket.on(SocketActions.SOCKET_CHANNEL_ERROR, ({ message }, callback) => {
            // Вывод ошибки
            this._dispatch(setSystemError(message));

            callback({ success: true, timestamp: Date.now() });
        });

        // Событие возникает при невозможности установить соединение или соединение было отклонено сервером (к примеру мидлваром)
        this._socket.on("connect_error", error => {
            const isSocketActive = this._socket.active;

            logger.error(i18next.t("core.socket.error.connect_error", { isSocketActive, message: error.message }));

            // Означает, что соединение было отклонено сервером и не равно авторизационной ошибке мидлвара сервера
            if (!isSocketActive && error.message !== SOCKET_MIDDLEWARE_ERROR) {
                this.emit(SocketEvents.RECONNECT);
                return;
            }

            // Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
        });

        this._socket.on("disconnect", reason => {
            const isSocketActive = this._socket.active;

            logger.debug(`disconnect [isSocketActive=${isSocketActive}, reason=${reason}]`);

            // Если сокет отключился по инициативе сервера, то перезапускаем сокет
            if (!isSocketActive && reason === SERVER_DISCONNECT) {
                this.emit(SocketEvents.RECONNECT);
            }

            // Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
        });
    }

    // Обработка системных событий у Manager socket.io-client
    private _socketManagerListeners() {
        this._socket.io.on("error", error => {
            this.emit(MainClientEvents.ERROR, i18next.t("core.socket.error.connect_error", { isSocketActive: this._socket.active, message: error.message }));
        });

        this._socket.io.on("ping", () => {
            logger.debug("pong sent to server");
        });

        this._socket.io.on("reconnect", attempt => {
            logger.info(`successfully reconnected after ${attempt} attempts`);
        });

        this._socket.io.on("reconnect_attempt", attempt => {
            logger.info(`reconnecting attempts number: ${attempt}...`);
        });

        this._socket.io.on("reconnect_error", error => {
            logger.info(`reconnecting failed with error: ${error}`);
        });

        this._socket.io.on("reconnect_failed", () => {
            this.emit(MainClientEvents.ERROR, i18next.t("core.socket.error.reconnect_failed"));
        });
    }

    private _bindListeners() {
        this._usersController.on(SocketEvents.SET_ONLINE_USER, (onlineUser: IUser) => {
            if (onlineUser && onlineUser.id !== this._myId) {
                this._dispatch(setOnlineUsers(onlineUser));
            }
        });
        this._usersController.on(SocketEvents.LOG_OUT, () => {
            this.emit(MainClientEvents.LOG_OUT);
        });

        this._usersController.on(SocketEvents.SEND_ACK, this._handleAck.bind(this));
        this._friendsController.on(SocketEvents.SEND_ACK, this._handleAck.bind(this));
        this._messagesController.on(SocketEvents.SEND_ACK, this._handleAck.bind(this));

        this._messagesController.on(SocketEvents.ADD_MESSAGE, (message: IMessage) => {
            if (window.location.pathname.toLowerCase() === Pages.messages + "/" + message.chatId.toLowerCase()) {
                this._dispatch(setMessage({ message, showUnreadDie: true, userId: this._myId }));
            } else {
                // Проигрываем аудио при получении нового сообщения
                const playAudio = new PlayAudio("/assets/audios/new-message-notification.mp3", this._dispatch, true, message.chatId);
                playAudio.init();
            }
        });
    }

    private _handleAck(validateData: ValidateHandleReturnType, cb: CallbackAckType, extraCb?: Function) {
        const ackData = validateData.success
            ? { success: true, timestamp: Date.now() }
            : { success: false, message: validateData.message };

        cb(ackData);

        if (extraCb) extraCb();
    }
}