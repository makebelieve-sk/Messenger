import { PayloadAction } from "@reduxjs/toolkit";

import { IUser } from "@custom-types/models.types";
import { FriendStateType } from "@custom-types/redux.types";

export default {
    addFriend: (state: FriendStateType, action: PayloadAction<IUser>) => {
        state.friends = state.friends 
            ? [...state.friends, action.payload]
            : [action.payload];
    },
    setFriends: (state: FriendStateType, action: PayloadAction<IUser[] | null>) => {
        state.friends = action.payload;
    },
    deleteFriend: (state: FriendStateType, action: PayloadAction<string>) => {
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
    setFriendsCount: (state: FriendStateType, action: PayloadAction<number>) => {
        state.friendsCount = action.payload;
    },
    setTopFriends: (state: FriendStateType, action: PayloadAction<IUser[] | null>) => {
        state.topFriends = action.payload;
    },
    setSubscribersCount: (state: FriendStateType, action: PayloadAction<number>) => {
        state.subscribersCount = action.payload;
    },
    setPossibleUsers: (state: FriendStateType, action: PayloadAction<IUser[] | null>) => {
        state.possibleUsers = action.payload;
    },
    setSearchValue: (state: FriendStateType, action: PayloadAction<string>) => {
        state.searchValue = action.payload;
    },
};