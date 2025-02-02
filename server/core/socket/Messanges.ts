import EventEmitter from "events";

import Logger from "../../service/logger";
import { SocketActions } from "../../types/enums";
import { ISocketUser, SocketWithUser } from "../../types/socket.types";
import { SocketEvents } from "../../types/events";

const logger = Logger("Socket:MessagesController");

// Контроллер по управлению сокет событиями друзей
export default class MessagesController extends EventEmitter {
    private readonly _user: ISocketUser;

    constructor(private readonly _socket: SocketWithUser) {
        super();

        this._user = this._socket.user as ISocketUser;
        this._init();
    }

    private _init() {
        logger.debug("_init");

        // Уведомляем всех пользователей чата (кроме себя) об отправке нового сообщения
        this._socket.on(SocketActions.MESSAGE, ({ data, usersInChat }) => {
            const newMessage = {
                ...data, 
                User: { 
                    id: this._user.id, 
                    firstName: this._user.firstName, 
                    thirdName: this._user.thirdName, 
                    avatarUrl: this._user.avatarUrl
                } 
            };

            logger.debug("SocketActions.MESSAGE [usersInChat=%j, type=%s, data=%j]", usersInChat, SocketActions.SEND_MESSAGE, newMessage);
            this.emit(SocketEvents.NOTIFY_ALL_ANOTHER_USERS, usersInChat, SocketActions.SEND_MESSAGE, newMessage);
        });

        // Уведомляем собеседника приватного чата об удалении сообщения
        this._socket.on(SocketActions.DELETE_MESSAGE, ({ companionId, messageId }) => {
            logger.debug("SocketActions.DELETE_MESSAGE [companionId=%s, type=%s, data=%j]", companionId, SocketActions.DELETE_MESSAGE, { messageId });
            this.emit(SocketEvents.NOTIFY_ALL_ANOTHER_USERS, companionId, SocketActions.DELETE_MESSAGE, { messageId });
        });

        // Уведомляем собеседника приватного чата об его удалении
        this._socket.on(SocketActions.DELETE_CHAT, ({ chatId, companionId }) => {
            logger.debug("SocketActions.DELETE_CHAT [companionId=%s, type=%s, data=%j]", companionId, SocketActions.DELETE_CHAT, { chatId });
            this.emit(SocketEvents.NOTIFY_ALL_ANOTHER_USERS, companionId, SocketActions.DELETE_CHAT, { chatId });
        });

        // Уведомляем всех участников чата (кроме себя) об изменении/редактировании сообщения
        this._socket.on(SocketActions.EDIT_MESSAGE, ({ data, usersInChat }) => {
            logger.debug("SocketActions.EDIT_MESSAGE [usersInChat=%j, type=%s, data=%j]", usersInChat, SocketActions.EDIT_MESSAGE, { data });
            this.emit(SocketEvents.NOTIFY_ALL_ANOTHER_USERS, usersInChat, SocketActions.EDIT_MESSAGE, { data });
        });

        // Уведомляем каждого автора сообщения о том, что оно было прочитано
        this._socket.on(SocketActions.CHANGE_READ_STATUS, ({ isRead, messages }) => {
            logger.debug("SocketActions.CHANGE_READ_STATUS [isRead=%s, type=%s, messages=%j]", isRead, SocketActions.ACCEPT_CHANGE_READ_STATUS, messages);

            for (const message of messages) {
                this.emit(SocketEvents.NOTIFY_ALL_ANOTHER_USERS, message.userId, SocketActions.ACCEPT_CHANGE_READ_STATUS, { ...message, isRead });
            }
        });

        // Уведомляем собеседников чата о том, что идет набор сообщения
        this._socket.on(SocketActions.NOTIFY_WRITE, ({ isWrite, chatId, usersInChat }) => {
            const data = { 
                isWrite, 
                chatId, 
                userName: this._user.firstName + " " + this._user.thirdName 
            };

            logger.debug("SocketActions.NOTIFY_WRITE [usersInChat=%j, type=%s, data=%j]", usersInChat, SocketActions.NOTIFY_WRITE, data);
            this.emit(
                SocketEvents.NOTIFY_ALL_ANOTHER_USERS, 
                usersInChat, 
                SocketActions.NOTIFY_WRITE, 
                data
            );
        });
    }
}