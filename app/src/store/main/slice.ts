import { createSlice } from "@reduxjs/toolkit";

import reducers from "@store/main/reducers";
import { MainStateType, RootState } from "@custom-types/redux.types";

// Начальное состояние
export const initialState: MainStateType = {
  isAuth: false,
  loading: false,
  friendNotification: 0,
  messageNotification: 0,
  onlineUsers: [],
};

// Создание состояния друзей
export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers,
});

// Состояние
export const selectMainState = (state: RootState) => state.main;

// Экшены
export const {
  setAuth, 
  setLoading,
  setFriendNotification,
  setMessageNotification,
  setOnlineUsers,
  deleteOnlineUser
} = mainSlice.actions;

// Редьюсер
export default mainSlice.reducer;