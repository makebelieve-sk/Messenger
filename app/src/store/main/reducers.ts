import { PayloadAction } from "@reduxjs/toolkit";

import { FriendsNoticeTypes } from "@custom-types/enums";
import { IUser } from "@custom-types/models.types";
import { MainStateType } from "@custom-types/redux.types";

export default {
    setAuth: (state: MainStateType, action: PayloadAction<boolean>) => {
        state.isAuth = action.payload;
    },
    setLoadingUserDetails: (state: MainStateType, action: PayloadAction<boolean>) => {
        state.loadingUserDetails = action.payload;
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