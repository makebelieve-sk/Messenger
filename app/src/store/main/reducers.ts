import { PayloadAction } from "@reduxjs/toolkit";

import { ICarouselImage } from "@modules/ImagesCarousel/Info";
import { FriendsNoticeTypes } from "@custom-types/enums";
import { IUser } from "@custom-types/models.types";
import { MainStateType } from "@custom-types/redux.types";

export default {
    setAuth: (state: MainStateType, action: PayloadAction<boolean>) => {
        state.isAuth = action.payload;
    },
    setLoading: (state: MainStateType, action: PayloadAction<boolean>) => {
        state.loading = action.payload;
    },
    setFriendNotification: (state: MainStateType, action: PayloadAction<FriendsNoticeTypes | number>) => {
        const data = action.payload;

        switch (data) {
            case FriendsNoticeTypes.ADD:
                state.friendNotification += 1;
                break;
            case FriendsNoticeTypes.REMOVE:
                state.friendNotification = state.friendNotification ? state.friendNotification - 1 : 0;
                break;
            default:
                state.friendNotification = typeof data === "number" ? data : 0;
                break;
        }
    },
    setModalConfirm: (state: MainStateType, action: PayloadAction<{ text: string; btnActionTitle: string; cb: Function; } | null>) => {
        state.modalConfirm = action.payload;
    },
    setImagesInCarousel: (state: MainStateType, action: PayloadAction<{ images: ICarouselImage[], index: number } | null>) => {
        state.imagesInCarousel = action.payload;
    },
    setMessageNotification: (state: MainStateType, action: PayloadAction<number>) => {
        state.messageNotification = action.payload;
    },
    setOnlineUsers: (state: MainStateType, action: PayloadAction<IUser>) => {
        const newUser = action.payload;
        const findUser = state.onlineUsers.find(onlineUser => onlineUser.id === newUser.id);

        if (!findUser) {
            state.onlineUsers.push(newUser);
        }
    },
    deleteOnlineUser: (state: MainStateType, action: PayloadAction<string>) => {
        state.onlineUsers = state.onlineUsers.filter(onlineUser => onlineUser.id !== action.payload);
    },
};