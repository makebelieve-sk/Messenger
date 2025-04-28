import EventEmitter from "eventemitter3";

import { validateHandleEvent } from "@core/socket/validation";
import Logger from "@service/Logger";
import { changeLastMessageInDialog, deleteDialog, deleteMessage, editMessage, setUnRead, setWriteMessage, updateMessage } from "@store/message/slice";
import { Pages, SocketActions, UnReadTypes } from "@custom-types/enums";
import { MainClientEvents, SocketEvents } from "@custom-types/events";
import { IUser } from "@custom-types/models.types";
import { AppDispatch } from "@custom-types/redux.types";
import { SocketType } from "@custom-types/socket.types";
import { getFullName } from "@utils/index";

const logger = Logger.init("Socket:MessagesController");

// Контроллер по управлению сокет событиями сообщений
export default class MessangesController extends EventEmitter {
    constructor(private readonly _socket: SocketType, private readonly _dispatch: AppDispatch) {
        super();

        this._init();
    }

    private _init() {
        // Получаем сообщение от пользователя
        this._socket.on(SocketActions.SEND_MESSAGE, ({ message }, callback) => {
            const validateData = validateHandleEvent(SocketActions.SEND_MESSAGE, { message });

            if (validateData.success) {
                logger.debug(`SocketActions.SEND_MESSAGE [messageId=${message.id}]`);

                if (message) {
                    this.emit(SocketEvents.ADD_MESSAGE, message);
    
                    // Удаляем набирающего сообщения пользователя
                    this._dispatch(setWriteMessage({ isWrite: false, chatId: message.chatId, userName: getFullName(message.User as IUser) }));
                    // Добавляем непрочитанное сообщение в глобальное состояние непрочитанных сообщений конкретного чата
                    this._dispatch(setUnRead({ type: UnReadTypes.ADD_MESSAGE, payload: { chatId: message.chatId, messageId: message.id } }));
                    // Обновляем последнее сообщение в диалогах
                    this._dispatch(changeLastMessageInDialog(message));
                }
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Получаем уведомление о том, что кто-то прочитал мое сообщение
        this._socket.on(SocketActions.ACCEPT_CHANGE_READ_STATUS, ({ message }, callback) => {
            const validateData = validateHandleEvent(SocketActions.ACCEPT_CHANGE_READ_STATUS, { message });

            if (validateData.success) {
                logger.debug(`SocketActions.ACCEPT_CHANGE_READ_STATUS [messageId=${message.id}]`);

                if (message) {
                    if (window.location.pathname.toLowerCase() === Pages.messages + "/" + message.chatId.toLowerCase()) {
                        this._dispatch(updateMessage({ messageId: message.id, field: "isRead", value: message.isRead }));
                    }
                }
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Получаем уведомление об удалении сообщения из приватного чата
        this._socket.on(SocketActions.DELETE_MESSAGE, ({ messageId }, callback) => {
            const validateData = validateHandleEvent(SocketActions.DELETE_MESSAGE, { messageId });

            if (validateData.success) {
                logger.debug(`SocketActions.DELETE_MESSAGE [messageId=${messageId}]`);
                this._dispatch(deleteMessage(messageId));
            }
            
            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Получаем уведомление об удалении приватного чата
        this._socket.on(SocketActions.DELETE_CHAT, ({ chatId }, callback) => {
            const validateData = validateHandleEvent(SocketActions.DELETE_CHAT, { chatId });

            if (validateData.success) {
                logger.debug(`SocketActions.DELETE_CHAT [chatId=${chatId}]`);

                // Если собеседник приватного чата находится на странице с чатом - перенаправляем его на страницу всех диалогов
                if (window.location.pathname.toLowerCase() === Pages.messages + "/" + chatId.toLowerCase()) {
                    this.emit(MainClientEvents.REDIRECT, Pages.messages);
                }
    
                this._dispatch(deleteDialog(chatId));
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Получаем уведомление об изменении/редактировании сообщения
        this._socket.on(SocketActions.EDIT_MESSAGE, ({ data }, callback) => {
            const validateData = validateHandleEvent(SocketActions.EDIT_MESSAGE, { data });

            if (validateData.success) {
                logger.debug(`SocketActions.EDIT_MESSAGE [data=${data}]`);
                this._dispatch(editMessage(data));
            }
            
            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });

        // Отрисовываем блок о том, что собеседник набирает сообщение
        this._socket.on(SocketActions.NOTIFY_WRITE, ({ isWrite, chatId, userName }, callback) => {
            const validateData = validateHandleEvent(SocketActions.NOTIFY_WRITE, { isWrite, chatId, userName } as { isWrite: boolean; chatId: string; userName: string; });

            if (validateData.success) {
                logger.debug(`SocketActions.NOTIFY_WRITE [isWrite=${isWrite}, chatId=${chatId}, userName=${userName}]`);
                this._dispatch(setWriteMessage({ isWrite, chatId, userName }));
            }

            this.emit(SocketEvents.SEND_ACK, validateData, callback);
        });
    }
}