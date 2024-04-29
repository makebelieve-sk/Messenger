import { createSlice } from "@reduxjs/toolkit";
import reducers from "./reducers";
import { InitialStateType, RootState } from "../../types/redux.types";

export type UserType = Pick<InitialStateType, "user" | "userDetail" | "photosCount" | "photos">;

// Начальное состояние
export const initialState: UserType = {
  user: null as never,
  userDetail: null,
  photosCount: 0,
  photos: []
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers,
});

// Состояние
export const selectUserState = (state: RootState) => state.users;

// Экшены
export const { setUser, setUserDetail, changeUserField, setPhotosCount, addPhotos, setPhotos, deletePhoto } = userSlice.actions;

// Редьюсер
export default userSlice.reducer;