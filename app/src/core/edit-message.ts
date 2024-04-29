import { Socket } from "socket.io-client";
import { IFile } from "../types/models.types";
// import Request from "./request/Request";
import CatchErrors from "./CatchErrors";
import { AppDispatch } from "../types/redux.types";
import { ClientToServerEvents, ServerToClientEvents } from "../types/socket.types";
import { ApiRoutes, MessageTypes, SocketActions } from "../types/enums";
// import { UserPartial } from "../pages/messages";
import { editMessage } from "../state/messages/slice";
// import { NextRouter } from "next/router";

export interface IEditMessage {
    id: string;
    type: MessageTypes;
    message: string; 
    files: IFile[];
};

interface IConstructor {
    editMessage: IEditMessage;
    usersInChat: any[];
    router: any;
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    dispatch: AppDispatch;
    setLoadingSend: React.Dispatch<React.SetStateAction<boolean>>;
};

// Класс, формируемый сущность "Редактируемое сообщение"
export default class EditMessage {
    private _editMessage: IEditMessage;
    private _usersInChat: any[];
    private _router: any;
    private _socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private _dispatch: AppDispatch;
    private _setLoadingSend: React.Dispatch<React.SetStateAction<boolean>>;

    constructor({ editMessage, usersInChat, router, socket, dispatch, setLoadingSend }: IConstructor) {
        this._editMessage = editMessage;

        this._usersInChat = usersInChat;
        this._router = router;
        this._socket = socket;
        this._dispatch = dispatch;
        this._setLoadingSend = setLoadingSend;
    };

    // Изменение сообщения в сторе
    editMessageInStore() {
        this._dispatch(editMessage(this._editMessage));
    };

    // Отправка сообщения по сокету
    sendMessageBySocket() {
        this._socket.emit(SocketActions.EDIT_MESSAGE, { data: this._editMessage, usersInChat: this._usersInChat });
    };

    // Обновление файлов в файловой системе и в БД
    saveFilesInDB() {
        if (this._editMessage.files.length) {
            const formData = new FormData();

            this._editMessage.files.forEach(file => {
                formData.append("file", file as never as File);
            });

            // Request.post(
            //     ApiRoutes.saveFiles,
            //     formData,
            //     undefined,
            //     (data: { files: IFile[] }) => {
            //         if (data.files && data.files.length) {
            //             const filesIds = data.files.map(file => file.id.toUpperCase());
            //             this._editMessage.files = data.files;

            //             this.editMessageInStore();
            //             this.sendMessageBySocket();
            //             this.updateMessageInDB(filesIds);
            //         }
            //     },
            //     (error: any) => CatchErrors.catch(error, this._dispatch),
            //     undefined,
            //     { headers: { "Content-type": "multipart/form-data" } }
            // );
        }
    };

    // Удаление старых файлов сообщения
    deleteOldFiles() {
        if (this._editMessage.files.length) {
            // Request.post(
            //     ApiRoutes.deleteFiles,
            //     { messageId: this._editMessage.id },
            //     this._setLoadingSend,
            //     () => this.saveFilesInDB(),
            //     (error: any) => CatchErrors.catch(error, this._dispatch),
            //     undefined
            // );
        }
    };

    // Обновление сообщения в базе данных
    updateMessageInDB(filesIds?: string[]) {
        // Request.post(
        //     ApiRoutes.updateMessage,
        //     { 
        //         ...this._editMessage,
        //         files: filesIds ? filesIds : null 
        //     },
        //     undefined,
        //     undefined,
        //     (error: any) => CatchErrors.catch(error, this._dispatch)
        // );
    };
};