import { Socket } from "socket.io";
import { SocketActions, CallStatus, SocketChannelErrorTypes, SettingType, MessageTypes, MessageReadStatus } from "./enums";
import { IMessage, IUser } from "./models.types";
import { IFullChatInfo } from "./chat.types";
import { UserPartial } from "./user.types";
import { IEditMessage } from "./message.types";

interface ISocketUser {
    userID: string;
    socketID: string;
    user: IUser;
    call?: { id: string; chatInfo: IFullChatInfo; usersInCall: any[]; };
};

type ISocketUsers = Map<string, ISocketUser>;

interface ICallData {
    roomId: string; 
    chatInfo: IFullChatInfo; 
    users: any[];
};

// Принимаем события с фронта на сервер
interface ClientToServerEvents {
    [SocketActions.FRIENDS]: (data: { type: string; payload: { to: string; acceptedFriend?: IUser; }; }) => void;
    [SocketActions.MESSAGE]: ({ data, usersInChat }: { data: IMessage; usersInChat: UserPartial[]; }) => void;
    [SocketActions.DELETE_MESSAGE]: ({ companionId, messageId }: { companionId: string; messageId: string; }) => void;
    [SocketActions.EDIT_MESSAGE]: ({ data }: { data: IEditMessage; usersInChat: UserPartial[]; }) => void;
    [SocketActions.DELETE_CHAT]: ({ companionId, chatId }: { companionId: string; chatId: string; }) => void;
    [SocketActions.CHANGE_READ_STATUS]: ({ isRead, messages }: { isRead: MessageReadStatus; messages: IMessage[]; }) => void;
    [SocketActions.CALL]: ({ roomId, users, chatInfo }: { 
        roomId: string;
        users: any[];
        chatInfo: IFullChatInfo;
    }) => void;
    [SocketActions.ACCEPT_CALL]: ({ roomId, chatInfo, usersInCall }: { 
        roomId: string; 
        chatInfo: IFullChatInfo; 
        usersInCall: any[]; 
    }) => void;
    [SocketActions.TRANSFER_CANDIDATE]: ({ peerId, iceCandidate }: { peerId: string; iceCandidate: any; }) => void;
    [SocketActions.TRANSFER_OFFER]: ({ peerId, sessionDescription }: { peerId: string; sessionDescription: any; }) => void;
    [SocketActions.CHANGE_CALL_STATUS]: ({ status, userTo }: { status: CallStatus; userTo: string; }) => void;
    [SocketActions.END_CALL]: ({ roomId, usersInCall }: { roomId: string; usersInCall?: any[]; }) => void;
    [SocketActions.CHANGE_STREAM]: ({ type, value, roomId }: { type: SettingType; value: boolean; roomId: string; }) => void;
    [SocketActions.GET_NEW_MESSAGE_ON_SERVER]: ({ id, type }: { id: string; type: MessageTypes; }) => void;
    [SocketActions.NOTIFY_WRITE]: ({ isWrite, chatId, usersInChat }: { isWrite: boolean; chatId: string; usersInChat: UserPartial[]; }) => void;
    [SocketActions.IS_TALKING]: ({ roomId, isTalking }: { roomId: string; isTalking: boolean; }) => void;
};

// Отправляем события с сервера на фронт
interface ServerToClientEvents {
    [SocketActions.GET_ALL_USERS]: (users: ISocketUsers) => void;
    [SocketActions.GET_NEW_USER]: (user: IUser) => void;
    [SocketActions.USER_DISCONNECT]: (userId: string) => void;
    [SocketActions.ADD_TO_FRIENDS]: () => void;
    [SocketActions.UNSUBSCRIBE]: () => void;
    [SocketActions.SEND_MESSAGE]: (message: IMessage) => void;
    [SocketActions.EDIT_MESSAGE]: ({ data }: { data: IEditMessage; }) => void;
    [SocketActions.ACCEPT_CHANGE_READ_STATUS]: ({ message }: { message: IMessage; }) => void;
    [SocketActions.NOTIFY_CALL]: ({ roomId, chatInfo, users }: ICallData) => void;
    [SocketActions.ADD_PEER]: ({ peerId, createOffer, userId }: { peerId: string; createOffer: boolean; userId: string }) => void;
    [SocketActions.GET_CANDIDATE]: ({ peerId, iceCandidate }: { peerId: string; iceCandidate: any; }) => void;
    [SocketActions.SESSION_DESCRIPTION]: ({ peerId, sessionDescription }: { peerId: string; sessionDescription: any; }) => void;
    [SocketActions.SET_CALL_STATUS]: ({ status }: { status: CallStatus; }) => void;
    [SocketActions.REMOVE_PEER]: ({ peerId, userId }: { peerId: string; userId: string; }) => void;
    [SocketActions.SOCKET_CHANNEL_ERROR]: ({ message, type }: { message: string; type?: SocketChannelErrorTypes; }) => void;
    [SocketActions.CHANGE_STREAM]: ({ type, value, peerId }: { type: SettingType; value: boolean; peerId: string; }) => void;
    [SocketActions.ADD_NEW_MESSAGE]: ({ newMessage }: { newMessage: IMessage; }) => void;
    [SocketActions.NOTIFY_WRITE]: ({ isWrite, chatId, userName }: { isWrite: boolean; chatId: string; userName: string; }) => void;
    [SocketActions.CANCEL_CALL]: () => void;
    [SocketActions.ALREADY_IN_CALL]: ({ roomId, chatInfo, users }: ICallData) => void;
    [SocketActions.NOT_ALREADY_IN_CALL]: () => void;
    [SocketActions.IS_TALKING]: ({ peerId, isTalking }: { peerId: string; isTalking: boolean; }) => void;
    [SocketActions.ACCEPT_FRIEND]: ({ user }: { user: IUser; }) => void;
    [SocketActions.BLOCK_FRIEND]: ({ userId }: { userId: string; }) => void;
    [SocketActions.DELETE_MESSAGE]: ({ messageId }: { messageId: string; }) => void;
    [SocketActions.DELETE_CHAT]: ({ chatId }: { chatId: string; }) => void;
};

// Принимаем события на сервере с другого сервера
interface InterServerEvents {
    
};

interface SocketWithUser extends Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any> { 
    user?: IUser;
};

export type {
    ClientToServerEvents, 
    ServerToClientEvents, 
    InterServerEvents,
    SocketWithUser,
    ICallData,
    ISocketUsers
};