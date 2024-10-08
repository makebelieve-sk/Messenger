import EventEmitter from "eventemitter3";

import { setCallId, setChatInfo, setModalVisible, setStatus, setUsers } from "../../state/calls/slice";
import { setSystemError } from "../../state/error/slice";
import { addFriend, deleteFriend } from "../../state/friends/slice";
import { deleteOnlineUser, setFriendNotification, setGlobalInCall, setOnlineUsers } from "../../state/main/slice";
import { changeLastMessageInDialog, deleteDialog, deleteMessage, editMessage, setMessage, setUnRead, setWriteMessage, updateMessage } from "../../state/messages/slice";
import { CallStatus, FriendsNoticeTypes, Pages, SocketActions, SocketChannelErrorTypes, UnReadTypes } from "../../types/enums";
import { IUser } from "../../types/models.types";
import { AppDispatch } from "../../types/redux.types";
import { SocketType } from "../../types/socket.types";
import { MainClientEvents } from "../../types/events";
import { getFullName } from "../../utils";
import PlayAudio from "../../utils/play-audio";

interface IConstructor {
    socket: SocketType;
    user: IUser;
    dispatch: AppDispatch;
};

const SERVER_DISCONNECT = "io server disconnect";

export default class SocketController extends EventEmitter {
    private readonly _socket: SocketType;
    private readonly _user: IUser;
    private readonly _dispatch: AppDispatch;

    constructor({ socket, user, dispatch }: IConstructor) {
        super();

        this._socket = socket;
        this._user = user;
        this._dispatch = dispatch;
        
        this._init();
    }

    private _reconnect() {
        this._socket.auth = { user: this._user };
        this._socket.connect();
    }

    private _init() {
        this._socket.on("connect", () => {
            // Список всех онлайн пользователей
            this._socket.on(SocketActions.GET_ALL_USERS, (users) => {
                const allOnlineUsers = Object.values(users).map(onlineUser => {
                    if (onlineUser.userID !== this._user.id) {
                        return onlineUser.user;
                    }
                });

                if (allOnlineUsers && allOnlineUsers.length) {
                    allOnlineUsers.forEach(onlineUser => {
                        if (onlineUser) {
                            this._dispatch(setOnlineUsers(onlineUser));
                        }
                    });
                }

                console.log('Юзеры онлайн: ', users);
            });

            // Новый пользователь онлайн
            this._socket.on(SocketActions.GET_NEW_USER, (newUser) => {
                this._dispatch(setOnlineUsers(newUser));
                console.log('Новый юзер: ', newUser);
            });

            // Пользователь отключился
            this._socket.on(SocketActions.USER_DISCONNECT, (userId) => {
                this._dispatch(deleteOnlineUser(userId));
                console.log('Юзер отключился: ', userId);
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
                        this._dispatch(setMessage({ message, showUnreadDie: true, userId: this._user.id }));
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

            // Добавляем сообщение в массив сообщений для отрисовки (не нужно помечать как непрочитанное)
            // Здесь просто выводим сообщение и всё
            this._socket.on(SocketActions.ADD_NEW_MESSAGE, ({ newMessage }) => {
                this._dispatch(setMessage({ message: newMessage }));
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

            // Меня уведомляют о новом звонке (одиночный/групповой)
            this._socket.on(SocketActions.NOTIFY_CALL, ({ roomId, chatInfo, users }) => {
                if (roomId && chatInfo && users && users.length) {
                    if (chatInfo.isSingle) {
                        this._dispatch(setChatInfo({
                            ...chatInfo,
                            chatName: users[0].friendName,
                            chatAvatar: users[0].avatarUrl
                        }));
                    } else {
                        this._dispatch(setChatInfo(chatInfo));
                    }

                    this._dispatch(setModalVisible(true));
                    this._dispatch(setStatus(CallStatus.NEW_CALL));
                    this._dispatch(setCallId(roomId));
                    this._dispatch(setUsers(users));

                    // Уведомляем инициатора вызова о получении уведомления
                    if (this._socket) {
                        this._socket.emit(SocketActions.CHANGE_CALL_STATUS, {
                            status: CallStatus.WAIT,
                            userTo: chatInfo.initiatorId
                        });
                    }
                }
            });

            // Установка нового статуса для звонка
            this._socket.on(SocketActions.SET_CALL_STATUS, ({ status }) => {
                if (status) {
                    this._dispatch(setStatus(status));
                }
            });

            // Уведомляем пользователя, что на другой вкладке звонок
            this._socket.on(SocketActions.ALREADY_IN_CALL, ({ roomId, chatInfo, users }) => {
                if (roomId && chatInfo && users && users.length) {
                    this._dispatch(setGlobalInCall({ roomId, chatInfo, users }));
                }
            });

            // Установка нового статуса для звонка
            this._socket.on(SocketActions.CANCEL_CALL, () => {
                // Обнуление состояния звонка
                // resetCallStore(this._dispatch);
            });

            // Звонок был завершен, и если текущая вкладка - не вкладка со звонком, 
            // то мы закрываем плашку с информацией о звонке
            this._socket.on(SocketActions.NOT_ALREADY_IN_CALL, () => {
                this._dispatch(setGlobalInCall(null));
            });

            // Обработка системного канала с ошибками
            this._socket.on(SocketActions.SOCKET_CHANNEL_ERROR, ({ message, type }) => {
                // Вывод ошибки
                this._dispatch(setSystemError(message));

                if (type) {
                    switch (type) {
                        case SocketChannelErrorTypes.CALLS:
                            // Обнуление состояния звонка
                            // resetCallStore(this._dispatch);
                            break;
                        default:
                            break;
                    }
                }
            });
        });

        // Событие возникает при невозможности установить соединение или соединение было отклонено сервером (к примеру мидлваром)
        this._socket.on("connect_error", (error: Error) => {
            const isSocketActive = this._socket.active;

            console.error(`Ошибка соединения [socket.active: ${isSocketActive}]: ${error.message}`);

            // Означает, что соединение было отклонено сервером
            if (!isSocketActive) {
                this._reconnect();
            }

            // Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
        });

        this._socket.on("disconnect", (reason) => {
            const isSocketActive = this._socket.active;

            // Если сокет отключился по инициативе сервера, то перезапускаем сокет
            if (!isSocketActive && reason === SERVER_DISCONNECT) {
                this._reconnect();
            }

            // Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
        });
    }
}