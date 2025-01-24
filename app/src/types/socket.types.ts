import { Socket } from "socket.io-client";

import { SocketActions, MessageReadStatus } from "@custom-types/enums";
import { IMessage, IUser } from "@custom-types/models.types";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

interface ISocketData {
    type: string;
    payload: {
        to: string;
        acceptedFriend?: IUser;
    };
};

// Отправляем события с клиента на сервер
interface ClientToServerEvents {
    [SocketActions.NOTIFY_WRITE]: ({ isWrite, chatId, usersInChat }: { isWrite: boolean; chatId: string; usersInChat: any[]; }) => void;
    [SocketActions.FRIENDS]: (data: ISocketData) => void;
    [SocketActions.MESSAGE]: ({ data, usersInChat }: { data: IMessage; usersInChat: any[]; }) => void;
    [SocketActions.EDIT_MESSAGE]: ({ data }: { data: any; usersInChat: any[]; }) => void;
    [SocketActions.DELETE_MESSAGE]: ({ companionId, messageId }: { companionId: string; messageId: string; }) => void;
    [SocketActions.DELETE_CHAT]: ({ companionId, chatId }: { companionId: string; chatId: string; }) => void;
    [SocketActions.CHANGE_READ_STATUS]: ({ isRead, messages }: { isRead: MessageReadStatus; messages: IMessage[]; }) => void;
};

// Отправляем события с сервера на клиент
interface ServerToClientEvents {
    [SocketActions.GET_ALL_USERS]: (users: IUser[]) => void;
    [SocketActions.GET_NEW_USER]: (user: IUser) => void;
    [SocketActions.USER_DISCONNECT]: (userId: string) => void;

    [SocketActions.ADD_TO_FRIENDS]: () => void;
    [SocketActions.UNSUBSCRIBE]: () => void;
    [SocketActions.ACCEPT_FRIEND]: ({ user }: { user: IUser; }) => void;
    [SocketActions.BLOCK_FRIEND]: ({ userId }: { userId: string; }) => void;

    [SocketActions.SOCKET_CHANNEL_ERROR]: (message: string) => void;

    [SocketActions.NOTIFY_WRITE]: ({ isWrite, chatId, userName }: { isWrite: boolean; chatId: string; userName: string; }) => void;
    [SocketActions.SEND_MESSAGE]: (message: IMessage) => void;
    [SocketActions.EDIT_MESSAGE]: ({ data }: { data: any; }) => void;
    [SocketActions.DELETE_MESSAGE]: ({ messageId }: { messageId: string; }) => void;
    [SocketActions.DELETE_CHAT]: ({ chatId }: { chatId: string; }) => void;
    [SocketActions.ACCEPT_CHANGE_READ_STATUS]: ({ message }: { message: IMessage; }) => void;
};

export type {
    SocketType,
    ClientToServerEvents, 
    ServerToClientEvents, 
    ISocketData
};