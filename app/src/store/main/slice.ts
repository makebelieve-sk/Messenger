import { createSlice } from "@reduxjs/toolkit";
import reducers from "./reducers";
import { InitialStateType, RootState } from "../../types/redux.types";

export type MainType = Pick<
  InitialStateType, 
  "isAuth" | "loading" | "modalConfirm" | "friendNotification" | "globalCall" | "imagesInCarousel" | "messageNotification" | "onlineUsers"
>;

// Начальное состояние
export const initialState: MainType = {
  isAuth: false,
  loading: false,
  friendNotification: 0,
  modalConfirm: null,
  globalCall: null,
  imagesInCarousel: null,
  messageNotification: 0,
  onlineUsers: [],
};

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
  setGlobalInCall, 
  setImagesInCarousel,
  setMessageNotification,
  setOnlineUsers,
  deleteOnlineUser,
  setModalConfirm
} = mainSlice.actions;

// Редьюсер
export default mainSlice.reducer;