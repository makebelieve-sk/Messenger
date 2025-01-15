import { createSlice } from "@reduxjs/toolkit";
import reducers from "./reducers";
import { InitialStateType, RootState } from "../../types/redux.types";

export type UserType = Pick<InitialStateType, "photosCount" | "photos">;

// Начальное состояние
export const initialState: UserType = {
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
export const { setPhotosCount, addPhotos, setPhotos, deletePhoto } = userSlice.actions;

// Редьюсер
export default userSlice.reducer;