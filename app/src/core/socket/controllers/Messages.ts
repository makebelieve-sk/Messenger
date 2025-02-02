import EventEmitter from "eventemitter3";

import Logger from "@service/Logger";
import { Pages, SocketActions, UnReadTypes } from "@custom-types/enums";
import { IUser } from "@custom-types/models.types";
import { AppDispatch } from "@custom-types/redux.types";
import { SocketType } from "@custom-types/socket.types";
import { MainClientEvents, SocketEvents } from "@custom-types/events";
import { changeLastMessageInDialog, deleteDialog, deleteMessage, editMessage, setUnRead, setWriteMessage, updateMessage } from "@store/message/slice";
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
        this._socket.on(SocketActions.SEND_MESSAGE, (message) => {
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
        });

        // Получаем уведомление о том, что кто-то прочитал мое сообщение
        this._socket.on(SocketActions.ACCEPT_CHANGE_READ_STATUS, ({ message }) => {
            logger.debug(`SocketActions.ACCEPT_CHANGE_READ_STATUS [messageId=${message.id}]`);

            if (message) {
                if (window.location.pathname.toLowerCase() === Pages.messages + "/" + message.chatId.toLowerCase()) {
                    this._dispatch(updateMessage({ messageId: message.id, field: "isRead", value: message.isRead }));
                }
            }
        });

        // Получаем уведомление об удалении сообщения из приватного чата
        this._socket.on(SocketActions.DELETE_MESSAGE, ({ messageId }) => {
            logger.debug(`SocketActions.DELETE_MESSAGE [messageId=${messageId}]`);
            this._dispatch(deleteMessage(messageId));
        });

        // Получаем уведомление об удалении приватного чата
        this._socket.on(SocketActions.DELETE_CHAT, ({ chatId }) => {
            logger.debug(`SocketActions.DELETE_CHAT [chatId=${chatId}]`);

            // Если собеседник приватного чата находится на странице с чатом - перенаправляем его на страницу всех диалогов
            if (window.location.pathname.toLowerCase() === Pages.messages + "/" + chatId.toLowerCase()) {
                this.emit(MainClientEvents.REDIRECT, Pages.messages);
            }

            this._dispatch(deleteDialog(chatId));
        });

        // Получаем уведомление об изменении/редактировании сообщения
        this._socket.on(SocketActions.EDIT_MESSAGE, ({ data }) => {
            logger.debug(`SocketActions.EDIT_MESSAGE [data=${data}]`);
            this._dispatch(editMessage(data));
        });

        // Отрисовываем блок о том, что собеседник набирает сообщение
        this._socket.on(SocketActions.NOTIFY_WRITE, ({ isWrite, chatId, userName }) => {
            logger.debug(`SocketActions.NOTIFY_WRITE [isWrite=${isWrite}, chatId=${chatId}, userName=${userName}]`);
            this._dispatch(setWriteMessage({ isWrite, chatId, userName }));
        });
    }
}