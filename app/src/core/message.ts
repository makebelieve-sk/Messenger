import { Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";
// import { NextRouter } from "next/router";
// import { IChatInfo } from "../pages/messages/[id]";
import { changeLastMessageInDialog, setMessage } from "../store/messages/slice";
import { ApiRoutes, SocketActions } from "../types/enums";
import { IFile, IMessage } from "../types/models.types";
import { AppDispatch } from "../types/redux.types";
import { ClientToServerEvents, ServerToClientEvents } from "../types/socket.types";
import Request from "./Request";
import CatchErrors from "./CatchErrors";
// import { UserPartial } from "../pages/messages";

interface IConstructor {
    newMessage: Omit<IMessage, "id" | "createDate">;
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    usersInChat: any[];
    dispatch: AppDispatch;
};

// Класс, формируемый сущность "Сообщения"
export default class Message {
    private _message: IMessage;
    private _socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private _usersInChat: any[];
    private _dispatch: AppDispatch;

    constructor ({ newMessage, socket, usersInChat, dispatch }: IConstructor) {
        const { userId, chatId, type, message, isRead, callId, authorAvatar } = newMessage;

        this._message = {
            id: uuid(),
            userId,
            chatId,
            type,
            createDate: new Date().toUTCString(),
            message,
            isRead,
            callId: callId ?? null,
            authorAvatar
        };
        this._socket = socket;
        this._usersInChat = usersInChat;
        this._dispatch = dispatch;
    };

    // Добавление сообщения в глобальное хранилище
    addMessageToStore() {
        this._dispatch(setMessage({ message: this._message }));
    };

    // Отправка сообщения по сокету
    sendMessageBySocket() {
        this._socket.emit(SocketActions.MESSAGE, { data: this._message, usersInChat: this._usersInChat });
        // Обновляем последнее сообщение в диалогах
        this._dispatch(changeLastMessageInDialog(this._message));
    };

    // Сохранение файлов в базе данных
    saveFilesInDB(files: File[], setLoadingSend: React.Dispatch<React.SetStateAction<boolean>>) {
        const formData = new FormData();

        files.forEach(file => {
            formData.append("file", file);
        });

        // Request.post(
        //     ApiRoutes.saveFiles,
        //     formData,
        //     setLoadingSend,
        //     (data: { files: IFile[] }) => {
        //         if (data.files && data.files.length) {
        //             const filesIds = data.files.map(file => file.id.toUpperCase());
        //             this._message.files = data.files;

        //             this.addMessageToStore();
        //             this.sendMessageBySocket();
        //             this.saveMessageInDB(filesIds);
        //         }
        //     },
        //     (error: any) => CatchErrors.catch(error, this._dispatch),
        //     undefined,
        //     { headers: { "Content-type": "multipart/form-data" } }
        // );
    };

    // Сохранение сообщения в базе данных
    saveMessageInDB(filesIds?: string[]) {
        // Request.post(
        //     ApiRoutes.saveMessage,
        //     {
        //         message: this._message,
        //         usersInChat: this._usersInChat,
        //         files: filesIds
        //     },
        //     undefined,
        //     undefined,
        //     (error: any) => CatchErrors.catch(error, this._dispatch)
        // );
    };
};