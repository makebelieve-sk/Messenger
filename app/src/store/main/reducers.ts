import { PayloadAction } from "@reduxjs/toolkit";
// import { IImage } from "../../components/message-types/image-message";
import { FriendsNoticeTypes } from "../../types/enums";
import { IUser } from "../../types/models.types";
import { ICallData } from "../../types/socket.types";
import { MainType } from "./slice";
import { ICarouselImage } from "../../modules/ImagesCarousel/Info/Info";

export default {
    setAuth: (state: MainType, action: PayloadAction<boolean>) => {
        state.isAuth = action.payload;
    },
    setLoadingUserDetails: (state: MainType, action: PayloadAction<boolean>) => {
        state.loadingUserDetails = action.payload;
    },
    setFriendNotification: (state: MainType, action: PayloadAction<FriendsNoticeTypes | number>) => {
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
    setModalConfirm: (state: MainType, action: PayloadAction<{ text: string; btnActionTitle: string; cb: Function; } | null>) => {
        state.modalConfirm = action.payload;
    },
    setGlobalInCall: (state: MainType, action: PayloadAction<null | ICallData>) => {
        state.globalCall = action.payload;
    },
    setImagesInCarousel: (state: MainType, action: PayloadAction<{ images: ICarouselImage[], index: number } | null>) => {
        state.imagesInCarousel = action.payload;
    },
    setMessageNotification: (state: MainType, action: PayloadAction<number>) => {
        state.messageNotification = action.payload;
    },
    setOnlineUsers: (state: MainType, action: PayloadAction<IUser>) => {
        const newUser = action.payload;
        const findUser = state.onlineUsers.find(onlineUser => onlineUser.id === newUser.id);

        if (!findUser) {
            state.onlineUsers.push(newUser);
        }
    },
    deleteOnlineUser: (state: MainType, action: PayloadAction<string>) => {
        state.onlineUsers = state.onlineUsers.filter(onlineUser => onlineUser.id !== action.payload);
    },
};