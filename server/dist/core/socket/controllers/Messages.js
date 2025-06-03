"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const events_1 = __importDefault(require("events"));
const validation_1 = require("@core/socket/validation");
const logger_1 = __importDefault(require("@service/logger"));
const events_2 = require("@custom-types/events");
const logger = (0, logger_1.default)("Socket:MessagesController");
// Контроллер по управлению сокет событиями друзей
class MessagesController extends events_1.default {
    constructor(_socket) {
        super();
        this._socket = _socket;
        this._user = this._socket.user;
        this._init();
    }
    _init() {
        logger.debug("_init");
        // Уведомляем всех пользователей чата (кроме себя) об отправке нового сообщения
        this._socket.on(common_types_1.SocketActions.MESSAGE, ({ data, usersInChat }, callback) => {
            const validateData = (0, validation_1.validateHandleEvent)(common_types_1.SocketActions.MESSAGE, {
                data,
                usersInChat,
            });
            if (validateData.success) {
                const newMessage = {
                    ...data,
                    User: {
                        id: this._user.id,
                        firstName: this._user.firstName,
                        thirdName: this._user.thirdName,
                        avatarUrl: this._user.avatarUrl,
                    },
                };
                logger.debug("SocketActions.MESSAGE [usersInChat=%j, type=%s, data=%j]", usersInChat, common_types_1.SocketActions.SEND_MESSAGE, newMessage);
                this.emit(events_2.SocketEvents.NOTIFY_FEW_ANOTHER_USERS, usersInChat, common_types_1.SocketActions.SEND_MESSAGE, { message: newMessage });
            }
            this._sendAck(validateData, callback);
        });
        // Уведомляем собеседника приватного чата об удалении сообщения
        this._socket.on(common_types_1.SocketActions.DELETE_MESSAGE, ({ companionId, messageId }, callback) => {
            const validateData = (0, validation_1.validateHandleEvent)(common_types_1.SocketActions.DELETE_MESSAGE, {
                companionId,
                messageId,
            });
            if (validateData.success) {
                logger.debug("SocketActions.DELETE_MESSAGE [companionId=%s, type=%s, data=%j]", companionId, common_types_1.SocketActions.DELETE_MESSAGE, { messageId });
                this.emit(events_2.SocketEvents.NOTIFY_ANOTHER_USER, companionId, common_types_1.SocketActions.DELETE_MESSAGE, { messageId });
            }
            this._sendAck(validateData, callback);
        });
        // Уведомляем собеседника приватного чата об его удалении
        this._socket.on(common_types_1.SocketActions.DELETE_CHAT, ({ chatId, companionId }, callback) => {
            const validateData = (0, validation_1.validateHandleEvent)(common_types_1.SocketActions.DELETE_CHAT, {
                chatId,
                companionId,
            });
            if (validateData.success) {
                logger.debug("SocketActions.DELETE_CHAT [companionId=%s, type=%s, data=%j]", companionId, common_types_1.SocketActions.DELETE_CHAT, { chatId });
                this.emit(events_2.SocketEvents.NOTIFY_ANOTHER_USER, companionId, common_types_1.SocketActions.DELETE_CHAT, { chatId });
            }
            this._sendAck(validateData, callback);
        });
        // Уведомляем всех участников чата (кроме себя) об изменении/редактировании сообщения
        this._socket.on(common_types_1.SocketActions.EDIT_MESSAGE, ({ data, usersInChat }, callback) => {
            const validateData = (0, validation_1.validateHandleEvent)(common_types_1.SocketActions.EDIT_MESSAGE, {
                data,
                usersInChat,
            });
            if (validateData.success) {
                logger.debug("SocketActions.EDIT_MESSAGE [usersInChat=%j, type=%s, data=%j]", usersInChat, common_types_1.SocketActions.EDIT_MESSAGE, { data });
                this.emit(events_2.SocketEvents.NOTIFY_FEW_ANOTHER_USERS, usersInChat, common_types_1.SocketActions.EDIT_MESSAGE, { data });
            }
            this._sendAck(validateData, callback);
        });
        // Уведомляем каждого автора сообщения о том, что оно было прочитано
        this._socket.on(common_types_1.SocketActions.CHANGE_READ_STATUS, ({ isRead, messages }, callback) => {
            const validateData = (0, validation_1.validateHandleEvent)(common_types_1.SocketActions.CHANGE_READ_STATUS, {
                isRead,
                messages,
            });
            if (validateData.success) {
                logger.debug("SocketActions.CHANGE_READ_STATUS [isRead=%s, type=%s, messages=%j]", isRead, common_types_1.SocketActions.ACCEPT_CHANGE_READ_STATUS, messages);
                for (const message of messages) {
                    this.emit(events_2.SocketEvents.NOTIFY_ANOTHER_USER, message.userId, common_types_1.SocketActions.ACCEPT_CHANGE_READ_STATUS, { ...message, isRead });
                }
            }
            this._sendAck(validateData, callback);
        });
        // Уведомляем собеседников чата о том, что идет набор сообщения
        this._socket.on(common_types_1.SocketActions.NOTIFY_WRITE, ({ isWrite, chatId, usersInChat }, callback) => {
            const validateData = (0, validation_1.validateHandleEvent)(common_types_1.SocketActions.NOTIFY_WRITE, {
                isWrite,
                chatId,
                usersInChat,
            });
            if (validateData.success) {
                const data = {
                    isWrite,
                    chatId,
                    userName: this._user.firstName + " " + this._user.thirdName,
                };
                logger.debug("SocketActions.NOTIFY_WRITE [usersInChat=%j, type=%s, data=%j]", usersInChat, common_types_1.SocketActions.NOTIFY_WRITE, data);
                this.emit(events_2.SocketEvents.NOTIFY_FEW_ANOTHER_USERS, usersInChat, common_types_1.SocketActions.NOTIFY_WRITE, data);
            }
            this._sendAck(validateData, callback);
        });
    }
    // Отправка ack обратно клиенту
    _sendAck(validateData, cb) {
        const ackData = validateData.success ? { success: true, timestamp: Date.now() } : { success: false, message: validateData.message };
        cb(ackData);
    }
}
exports.default = MessagesController;
//# sourceMappingURL=Messages.js.map