import { FileVarieties, MessageTypes } from "@custom-types/enums";

// В данном файле хранятся описания самих структур моделей.
// Большая часть их них генерируется на сервере либо их базы данных и возвращается на клиент.
// Некоторые формируются прямиков на клиенте и отправляются на сервер (сообщения, как пример).
// В любом случае, данные интерфейсы используются на всех уровне клиента и они неизменны.

// Интерфейс структуры данных "Пользователь"
export interface IUser {
    id: string;
    firstName: string;
    secondName: string;
    thirdName: string;
    email: string;
    phone: string;
    avatarUrl: string;
};

// Интерфейс структуры данных "Дополнительная информация пользователя"
export interface IUserDetails {
    id: number;
    userId: string;
    birthday: string;
    city: string;
    work: string;
    sex: string;
    lastSeen?: string;
};

// Интерфейс структуры данных "Друг"
export interface IFriend {
    id: number;
    userId: string;
    friendId: string;
};

// Интерфейс структуры данных "Подписчик"
export interface ISubscriber {
    id: number;
    userId: string;
    subscriberId: string;
    leftInSubs: number;
};

// Интерфейс структуры данных "Сообщение"
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
    Call?: any;
    authorAvatar?: string;
};

// Интерфейс структуры данных "Диалог"
export interface IChat {
    id: string;
    name: string | null;
    avatarUrl: string | null;
};

// Интерфейс структуры данных "Файл"
export interface IFile {
    id: string;
    name: string;
    size: number;
    path: string;
    extension: string;
};

// Интерфейс структуры данных "Прочтенное сообщение"
export interface IReadMessages {
    id: string;
    userId: string;
    messageId: string;
    isRead: number;
};

// Интерфейс структуры данных "Фотография"
export interface IPhoto {
    id: string;
    userId: string;
    path: string;
    createDate: string;
    User?: Pick<IUser, "id" | "firstName" | "thirdName" | "avatarUrl">;
};

// Интерфейс структуры данных "Пользователи в диалоге"
export interface IUsersInChat {
    id: string;
    userId: string;
    chatId: string;
};

// Интерфейс структуры данных "Заблокированный пользователь"
export interface IBlockUsers {
    id: string;
    userId: string;
    userBlocked: string;
};

// Интерфейс структуры данных "Звуковое уведомление диалога"
export interface IChatSoundNotifications {
    id: string;
    chatId: string;
    userId: string;
};

// Интерфейс структуры данных "Удаленное сообщение"
export interface IDeletedMessages {
    id: string;
    messageId: string;
    userId: string;
};

// Интерфейс структуры данных "Удаленный диалог"
export interface IDeletedChats {
    id: string;
    chatId: string;
    userId: string;
};

// Интерфейс структуры данных "Файл в сообщении"
export interface IFilesInMessage {
    id: string;
    messageId: string;
    fileId: string;
};