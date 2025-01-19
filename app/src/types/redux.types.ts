import store from "@store/index";
import { ICarouselImage } from "@modules/ImagesCarousel/Info";
import { IMessage, IPhoto, IUser } from "@custom-types/models.types";

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// Интерфейс состояния ошибки приложения
export interface ErrorStateType {
    error: null | string;
    systemError: null | string;
};

// Интерфейс состояния друзей приложения
export interface FriendStateType {
    possibleUsers: null | IUser[];
    friends: null | IUser[];
    friendsCount: number;
    topFriends: null | IUser[];
    subscribersCount: number;
    searchValue: string;
};

// Интерфейс состояния общего приложения
export interface MainStateType {
    isAuth: boolean;
    loading: boolean;
    modalConfirm: null | { text: string; btnActionTitle: string; cb: Function;};
    friendNotification: number;
    imagesInCarousel: null | { images: ICarouselImage[]; index: number; };
    messageNotification: number;
    onlineUsers: IUser[];
};

// Интерфейс состояния сообщений приложения
export interface MessageStateType {
    dialogs: any[];
    unRead: { [chatId: string]: string[]; };
    messages: IMessage[];
    visibleUnReadMessages: null | string;
    isWrite: { [chatId: string]: string[]; };
    scrollDownAfterNewMsg: boolean;
    usersInChat: any[];
    editMessage: null | IMessage;
    attachmentsModal: null | { chatId: string; isOpen: boolean; };
};

// Интерфейс состояния сообщений приложения
export interface UserStateType {
    photosCount: number;
    photos: IPhoto[];
};