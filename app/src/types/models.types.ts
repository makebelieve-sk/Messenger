import { CallTypes, FileVarieties, MessageTypes } from "./enums";

// Интерфейс атрибутов модели Users
export interface IUser {
    id: string;
    firstName: string;
    secondName: string;
    thirdName: string;
    email: string;
    phone: string;
    password: string;
    avatarUrl: string;
    salt: string;
};

// Интерфейс атрибутов модели User_details
export interface IUserDetails {
    id: number;
    userId: string;
    birthday: string;
    city: string;
    work: string;
    sex: string;
    lastSeen?: string;
};

// Интерфейс атрибутов модели Friends
export interface IFriend {
    id: number;
    userId: string;
    friendId: string;
};

// Интерфейс атрибутов модели Subscribers
export interface ISubscriber {
    id: number;
    userId: string;
    subscriberId: string;
    leftInSubs: number;
};

// Интерфейс атрибутов модели Messages
export interface IMessage {
    id: string;
    userId: string;
    chatId: string;
    files?: string[] | File[] | null | string | IFile[];
    type: MessageTypes;
    createDate: string;
    message: string;
    fileExt?: FileVarieties;
    callId?: string | null;
    isRead: number;
    // Модель чата
    Chat?: { id: string; };
    // Модель пользователя (кто отправитель сообщения)
    User?: {
        id: string;
        firstName: string;
        thirdName: string;
        avatarUrl: string;
    };
    Call?: ICall;
    authorAvatar?: string;
};

// Интерфейс атрибутов модели Chats
export interface IChat {
    id: string;
    name: string | null;
    avatarUrl: string | null;
};

// Интерфейс атрибутов модели Calls
export interface ICall {
    id: string;
    name: string;
    type: CallTypes;
    initiatorId?: string;
    chatId?: string;
    startTime?: string;
    endTime?: string;
    UsersInCall?: IUsersInCall[]
};

// Интерфейс атрибутов модели Files
export interface IFile {
    id: string;
    name: string;
    size: number;
    path: string;
    extension: string;
};

// Интерфейс атрибутов модели ReadMessages
export interface IReadMessages {
    id: string;
    userId: string;
    messageId: string;
    isRead: number;
};

// Интерфейс атрибутов модели Photos
export interface IPhoto {
    id: string;
    userId: string;
    path: string;
    createDate: string;
    User?: Pick<IUser, "id" | "firstName" | "thirdName" | "avatarUrl">;
};

// Интерфейс атрибутов модели UsersInChat
export interface IUsersInChat {
    id: string;
    userId: string;
    chatId: string;
};

// Интерфейс атрибутов модели UsersInCall
export interface IUsersInCall {
    id: string;
    userId: string;
    callId: string;
};

// Интерфейс атрибутов модели BlockUsers
export interface IBlockUsers {
    id: string;
    userId: string;
    userBlocked: string;
};

// Интерфейс атрибутов модели ChatSoundNotifications
export interface IChatSoundNotifications {
    id: string;
    chatId: string;
    userId: string;
};

// Интерфейс атрибутов модели DeletedMessages
export interface IDeletedMessages {
    id: string;
    messageId: string;
    userId: string;
};

// Интерфейс атрибутов модели DeletedChats
export interface IDeletedChats {
    id: string;
    chatId: string;
    userId: string;
};

// Интерфейс атрибутов модели FilesInMessage
export interface IFilesInMessage {
    id: string;
    messageId: string;
    fileId: string;
};