import EventEmitter from "events";

import Logger from "@service/logger";
import { SocketActions } from "@custom-types/enums";
import { CallbackAckType, ISocketUser, SocketWithUser } from "@custom-types/socket.types";
import { SocketEvents } from "@custom-types/events";
import { validateHandleEvent, ValidateHandleReturnType } from "@core/socket/validation";

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
        this._socket.on(SocketActions.MESSAGE, ({ data, usersInChat }, callback) => {
            const validateData = validateHandleEvent(SocketActions.MESSAGE, { data, usersInChat });

            if (validateData.success) {
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
                this.emit(SocketEvents.NOTIFY_FEW_ANOTHER_USERS, usersInChat, SocketActions.SEND_MESSAGE, { message: newMessage });
            }

            this._sendAck(validateData, callback);
        });

        // Уведомляем собеседника приватного чата об удалении сообщения
        this._socket.on(SocketActions.DELETE_MESSAGE, ({ companionId, messageId }, callback) => {
            const validateData = validateHandleEvent(SocketActions.DELETE_MESSAGE, { companionId, messageId });

            if (validateData.success) {
                logger.debug("SocketActions.DELETE_MESSAGE [companionId=%s, type=%s, data=%j]", companionId, SocketActions.DELETE_MESSAGE, { messageId });
                this.emit(SocketEvents.NOTIFY_ANOTHER_USER, companionId, SocketActions.DELETE_MESSAGE, { messageId });
            }

            this._sendAck(validateData, callback);
        });

        // Уведомляем собеседника приватного чата об его удалении
        this._socket.on(SocketActions.DELETE_CHAT, ({ chatId, companionId }, callback) => {
            const validateData = validateHandleEvent(SocketActions.DELETE_CHAT, { chatId, companionId });

            if (validateData.success) {
                logger.debug("SocketActions.DELETE_CHAT [companionId=%s, type=%s, data=%j]", companionId, SocketActions.DELETE_CHAT, { chatId });
                this.emit(SocketEvents.NOTIFY_ANOTHER_USER, companionId, SocketActions.DELETE_CHAT, { chatId });
            }

            this._sendAck(validateData, callback);
        });

        // Уведомляем всех участников чата (кроме себя) об изменении/редактировании сообщения
        this._socket.on(SocketActions.EDIT_MESSAGE, ({ data, usersInChat }, callback) => {
            const validateData = validateHandleEvent(SocketActions.EDIT_MESSAGE, { data, usersInChat });

            if (validateData.success) {
                logger.debug("SocketActions.EDIT_MESSAGE [usersInChat=%j, type=%s, data=%j]", usersInChat, SocketActions.EDIT_MESSAGE, { data });
                this.emit(SocketEvents.NOTIFY_FEW_ANOTHER_USERS, usersInChat, SocketActions.EDIT_MESSAGE, { data });
            }
            
            this._sendAck(validateData, callback);
        });

        // Уведомляем каждого автора сообщения о том, что оно было прочитано
        this._socket.on(SocketActions.CHANGE_READ_STATUS, ({ isRead, messages }, callback) => {
            const validateData = validateHandleEvent(SocketActions.CHANGE_READ_STATUS, { isRead, messages });

            if (validateData.success) {
                logger.debug("SocketActions.CHANGE_READ_STATUS [isRead=%s, type=%s, messages=%j]", isRead, SocketActions.ACCEPT_CHANGE_READ_STATUS, messages);

                for (const message of messages) {
                    this.emit(SocketEvents.NOTIFY_ANOTHER_USER, message.userId, SocketActions.ACCEPT_CHANGE_READ_STATUS, { ...message, isRead });
                }
            }
            
            this._sendAck(validateData, callback);
        });

        // Уведомляем собеседников чата о том, что идет набор сообщения
        this._socket.on(SocketActions.NOTIFY_WRITE, ({ isWrite, chatId, usersInChat }, callback) => {
            const validateData = validateHandleEvent(SocketActions.NOTIFY_WRITE, { isWrite, chatId, usersInChat });

            if (validateData.success) {
                const data = { 
                    isWrite, 
                    chatId, 
                    userName: this._user.firstName + " " + this._user.thirdName 
                };
    
                logger.debug("SocketActions.NOTIFY_WRITE [usersInChat=%j, type=%s, data=%j]", usersInChat, SocketActions.NOTIFY_WRITE, data);
                this.emit(
                    SocketEvents.NOTIFY_FEW_ANOTHER_USERS, 
                    usersInChat, 
                    SocketActions.NOTIFY_WRITE, 
                    data
                );
            }

            this._sendAck(validateData, callback);
        });
    }

    // Отправка ack обратно клиенту
    private _sendAck(validateData: ValidateHandleReturnType, cb: CallbackAckType) {
        const ackData = validateData.success
            ? { success: true, timestamp: Date.now() }
            : { success: false, message: validateData.message };

        cb(ackData);
    }
}