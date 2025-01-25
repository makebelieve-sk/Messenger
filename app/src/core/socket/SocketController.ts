import EventEmitter from "eventemitter3";

import i18next from "@service/i18n";
import { setSystemError } from "@store/error/slice";
import { addFriend, deleteFriend } from "@store/friend/slice";
import { deleteOnlineUser, setFriendNotification, setOnlineUsers } from "@store/main/slice";
import { changeLastMessageInDialog, deleteDialog, deleteMessage, editMessage, setMessage, setUnRead, setWriteMessage, updateMessage } from "@store/message/slice";
import { FriendsNoticeTypes, Pages, SocketActions, UnReadTypes } from "@custom-types/enums";
import { IUser } from "@custom-types/models.types";
import { AppDispatch } from "@custom-types/redux.types";
import { SocketType } from "@custom-types/socket.types";
import { MainClientEvents, SocketEvents } from "@custom-types/events";
import { getFullName } from "@utils/index";
import PlayAudio from "@utils/play-audio";

interface IConstructor {
    socket: SocketType;
    myUser: IUser;
    dispatch: AppDispatch;
};

const SERVER_DISCONNECT = "io server disconnect";

export default class SocketController extends EventEmitter {
    private readonly _socket: SocketType;
    private readonly _myUser: IUser;
    private readonly _dispatch: AppDispatch;

    constructor({ socket, myUser, dispatch }: IConstructor) {
        super();

        this._socket = socket;
        this._myUser = myUser;
        this._dispatch = dispatch;
        
        this._init();
    }

    private _init() {
        this._socket.on("connect", () => {
            console.log(i18next.t("core.socket.connection_established", { socketId: this._socket.id }));
        });

        // Список всех онлайн пользователей
        this._socket.on(SocketActions.GET_ALL_USERS, (users) => {
            users.forEach(onlineUser => {
                if (onlineUser && onlineUser.id !== this._myUser.id) {
                    this._dispatch(setOnlineUsers(onlineUser));
                }
            });

            console.log(i18next.t("core.socket.online_users"), users);
        });

        // Новый пользователь онлайн
        this._socket.on(SocketActions.GET_NEW_USER, (newUser) => {
            this._dispatch(setOnlineUsers(newUser));
            console.log(i18next.t("core.socket.new_user_connected"), newUser);
        });

        // Пользователь отключился
        this._socket.on(SocketActions.USER_DISCONNECT, (userId) => {
            this._dispatch(deleteOnlineUser(userId));
            console.log(i18next.t("core.socket.user_disconnected"), userId);
        });

        // Подписываемся на пользователя
        this._socket.on(SocketActions.ADD_TO_FRIENDS, () => {
            this._dispatch(setFriendNotification(FriendsNoticeTypes.ADD));
        });

        // Пользователь добавил меня в друзья после моей заявки
        this._socket.on(SocketActions.ACCEPT_FRIEND, ({ user }) => {
            this._dispatch(addFriend(user));
        });

        // Отписываемся от пользователя
        this._socket.on(SocketActions.UNSUBSCRIBE, () => {
            this._dispatch(setFriendNotification(FriendsNoticeTypes.REMOVE));
        });

        // Пользователь заблокировал меня
        this._socket.on(SocketActions.BLOCK_FRIEND, ({ userId }) => {
            this._dispatch(deleteFriend(userId));
        });

        // Получаем сообщение от пользователя
        this._socket.on(SocketActions.SEND_MESSAGE, (message) => {
            if (message) {
                if (window.location.pathname.toLowerCase() === Pages.messages + "/" + message.chatId.toLowerCase()) {
                    this._dispatch(setMessage({ message, showUnreadDie: true, userId: this._myUser.id }));
                } else {
                    // Проигрываем аудио при получении нового сообщения
                    const playAudio = new PlayAudio("/assets/audios/new-message-notification.mp3", this._dispatch, true, message.chatId);
                    playAudio.init();
                }

                // Удаляем набирающего сообщения пользователя
                this._dispatch(setWriteMessage({ isWrite: false, chatId: message.chatId, userName: getFullName(message.User as IUser) }));
                // Добавляем непрочитанное сообщение в глобальное состояние непрочитанных сообщений конкретного чата
                this._dispatch(setUnRead({ type: UnReadTypes.ADD_MESSAGE, payload: { chatId: message.chatId, messageId: message.id } }));
                // Обновляем последнее сообщение в диалогах
                this._dispatch(changeLastMessageInDialog(message));
            }
        });

        // Получаем уведомление о том, что кто-то прочитал мое сообщение
        this._socket.on(SocketActions.ACCEPT_CHANGE_READ_STATUS, ({ message }) => {
            if (message) {
                if (window.location.pathname.toLowerCase() === Pages.messages + "/" + message.chatId.toLowerCase()) {
                    this._dispatch(updateMessage({ messageId: message.id, field: "isRead", value: message.isRead }));
                }
            }
        });

        // Получаем уведомление об удалении сообщения из приватного чата
        this._socket.on(SocketActions.DELETE_MESSAGE, ({ messageId }) => {
            this._dispatch(deleteMessage(messageId));
        });

        // Получаем уведомление об удалении приватного чата
        this._socket.on(SocketActions.DELETE_CHAT, ({ chatId }) => {
            // Если собеседник приватного чата находится на странице с чатом - перенаправляем его на страницу всех диалогов
            if (window.location.pathname.toLowerCase() === Pages.messages + "/" + chatId.toLowerCase()) {
                this.emit(MainClientEvents.REDIRECT, Pages.messages);
            }

            this._dispatch(deleteDialog(chatId));
        });

        // Получаем уведомление об изменении/редактировании сообщения
        this._socket.on(SocketActions.EDIT_MESSAGE, ({ data }) => {
            this._dispatch(editMessage(data));
        });

        // Отрисовываем блок о том, что собеседник набирает сообщение
        this._socket.on(SocketActions.NOTIFY_WRITE, ({ isWrite, chatId, userName }) => {
            this._dispatch(setWriteMessage({ isWrite, chatId, userName }));
        });

        // Обработка системного канала с ошибками
        this._socket.on(SocketActions.SOCKET_CHANNEL_ERROR, (message) => {
            // Вывод ошибки
            this._dispatch(setSystemError(message));
        });

        // Событие возникает при невозможности установить соединение или соединение было отклонено сервером (к примеру мидлваром)
        this._socket.on("connect_error", (error: Error) => {
            const isSocketActive = this._socket.active;

            console.error(i18next.t("core.socket.error.connection", { isSocketActive: isSocketActive, message: error.message }));

            // Означает, что соединение было отклонено сервером
            if (!isSocketActive) {
                this.emit(SocketEvents.RECONNECT);
            }

            // Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
        });

        this._socket.on("disconnect", (reason) => {
            const isSocketActive = this._socket.active;

            // Если сокет отключился по инициативе сервера, то перезапускаем сокет
            if (!isSocketActive && reason === SERVER_DISCONNECT) {
                this.emit(SocketEvents.RECONNECT);
            }

            // Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
        });
    }
}