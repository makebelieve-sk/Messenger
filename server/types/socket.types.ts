import { Socket, Server } from "socket.io";

import { SocketActions, MessageReadStatus } from "./enums";
import { IMessage } from "./models.types";
import { ISafeUser, UserPartial } from "./user.types";
import { IEditMessage } from "./message.types";

interface ISocketUser extends ISafeUser {
    socketID: string;
};

type SocketType = Server<ClientToServerEvents, ServerToClientEvents>;

interface SocketWithUser extends Socket<ClientToServerEvents, ServerToClientEvents> { 
    user?: ISafeUser;
};

// Отправляем события с клиента на сервер
interface ClientToServerEvents {
    [SocketActions.NOTIFY_WRITE]: ({ isWrite, chatId, usersInChat }: { isWrite: boolean; chatId: string; usersInChat: UserPartial[]; }) => void;
    [SocketActions.FRIENDS]: (data: { type: string; payload: { to: string; acceptedFriend?: ISafeUser; }; }) => void;
    [SocketActions.MESSAGE]: ({ data, usersInChat }: { data: IMessage; usersInChat: UserPartial[]; }) => void;
    [SocketActions.EDIT_MESSAGE]: ({ data }: { data: IEditMessage; usersInChat: UserPartial[]; }) => void;
    [SocketActions.DELETE_MESSAGE]: ({ companionId, messageId }: { companionId: string; messageId: string; }) => void;
    [SocketActions.DELETE_CHAT]: ({ companionId, chatId }: { companionId: string; chatId: string; }) => void;
    [SocketActions.CHANGE_READ_STATUS]: ({ isRead, messages }: { isRead: MessageReadStatus; messages: IMessage[]; }) => void;    
};

// Отправляем события с сервера на клиент
interface ServerToClientEvents {
    [SocketActions.GET_ALL_USERS]: (users: ISocketUser[]) => void;
    [SocketActions.GET_NEW_USER]: (user: ISocketUser) => void;
    [SocketActions.USER_DISCONNECT]: (userId: string) => void;

    [SocketActions.ADD_TO_FRIENDS]: () => void;
    [SocketActions.UNSUBSCRIBE]: () => void;
    [SocketActions.ACCEPT_FRIEND]: ({ user }: { user: ISafeUser; }) => void;
    [SocketActions.BLOCK_FRIEND]: ({ userId }: { userId: string; }) => void;

    [SocketActions.SOCKET_CHANNEL_ERROR]: (message: string) => void;

    [SocketActions.NOTIFY_WRITE]: ({ isWrite, chatId, userName }: { isWrite: boolean; chatId: string; userName: string; }) => void;
    [SocketActions.SEND_MESSAGE]: (message: IMessage) => void;
    [SocketActions.EDIT_MESSAGE]: ({ data }: { data: IEditMessage; }) => void;
    [SocketActions.DELETE_MESSAGE]: ({ messageId }: { messageId: string; }) => void;
    [SocketActions.DELETE_CHAT]: ({ chatId }: { chatId: string; }) => void;
    [SocketActions.ACCEPT_CHANGE_READ_STATUS]: ({ message }: { message: IMessage; }) => void;
};

export type {
    ISocketUser,
    SocketType,
    SocketWithUser,
    ClientToServerEvents, 
    ServerToClientEvents
};