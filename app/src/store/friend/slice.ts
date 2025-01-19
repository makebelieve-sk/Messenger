import { createSlice } from "@reduxjs/toolkit";

import reducers from "@store/friend/reducers";
import { FriendStateType, RootState } from "@custom-types/redux.types";

// Начальное состояние
export const initialState: FriendStateType = {
  friends: null,
  friendsCount: 0,
  subscribersCount: 0,
  topFriends: null,
  possibleUsers: null,
  searchValue: ""
};

// Создание состояния друзей
export const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers,
});

// Состояние
export const selectFriendState = (state: RootState) => state.friends;

// Экшены
export const { 
  addFriend, 
  setFriends, 
  deleteFriend, 
  setFriendsCount, 
  setPossibleUsers, 
  setTopFriends, 
  setSubscribersCount, 
  setSearchValue 
} = friendsSlice.actions;

// Редьюсер
export default friendsSlice.reducer;