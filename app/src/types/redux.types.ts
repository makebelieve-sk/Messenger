import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import { CallStatus } from "./enums";
// import { IDialog, UserPartial } from "../pages/messages";
// import { IFullChatInfo } from "../pages/messages/[id]";
// import store from "../state/store";
import store from "../store";
import { IMessage, IPhoto, IUser } from "./models.types";
import { ICallData } from "./socket.types";
import { ICarouselImage } from "../modules/ImagesCarousel/Info/Info";
// import { IImage } from "../components/message-types/image-message";

export type InitialStateType = {
    isAuth: boolean;
    loading: boolean;
    loadingUserDetails: boolean;
    error: null | string;
    systemError: string | null;
    friends: IUser[] | null;
    friendsCount: number;
    subscribersCount: number;
    topFriends: IUser[] | null;
    possibleUsers: IUser[] | null;
    friendNotification: number;
    globalCall: null | ICallData;
    imagesInCarousel: { images: ICarouselImage[]; index: number; } | null;
    messageNotification: number;
    dialogs: any[];
    unRead: { [chatId: string]: string[]; };
    messages: IMessage[];
    visibleUnReadMessages: string | null;
    visible: boolean;
    status: CallStatus;
    callId: string | null;
    localStream: MediaStream | null;
    chatInfo: any | null;
    users: IUser[] | null;
    isWrite: { [chatId: string]: string[]; };
    scrollDownAfterNewMsg: boolean;
    usersInChat: any[];
    editMessage: null | IMessage;
    onlineUsers: IUser[];
    searchValue: string;
    photosCount: number;
    photos: IPhoto[];
    modalConfirm: { text: string; btnActionTitle: string; cb: Function; } | null;
    attachmentsModal: { chatId: string; isOpen: boolean; } | null;
};

export interface ICallSettings {
    audio: boolean;
    video: { width: number; height: number; } | boolean;
};

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export type StoreType = ReturnType<typeof configureStore>;