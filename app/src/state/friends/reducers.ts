import { PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types/models.types";
import { FreindsType } from "./slice";

export default {
    addFriend: (state: FreindsType, action: PayloadAction<IUser>) => {
        state.friends = state.friends 
            ? [...state.friends, action.payload]
            : [action.payload];
    },
    setFriends: (state: FreindsType, action: PayloadAction<IUser[] | null>) => {
        state.friends = action.payload;
    },
    deleteFriend: (state: FreindsType, action: PayloadAction<string>) => {
        if (state.friends) {
            const friend = state.friends.find(friend => friend.id === action.payload);

            if (friend) {
                const indexOf = state.friends.indexOf(friend);

                if (indexOf >= 0) {
                    state.friends = [...state.friends.slice(0, indexOf), ...state.friends.slice(indexOf + 1)];
                }
            }
        }
    },
    setFriendsCount: (state: FreindsType, action: PayloadAction<number>) => {
        state.friendsCount = action.payload;
    },
    setTopFriends: (state: FreindsType, action: PayloadAction<IUser[] | null>) => {
        state.topFriends = action.payload;
    },
    setSubscribersCount: (state: FreindsType, action: PayloadAction<number>) => {
        state.subscribersCount = action.payload;
    },
    setPossibleUsers: (state: FreindsType, action: PayloadAction<IUser[] | null>) => {
        state.possibleUsers = action.payload;
    },
    setSearchValue: (state: FreindsType, action: PayloadAction<string>) => {
        state.searchValue = action.payload;
    },
};