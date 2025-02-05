import { createSlice } from "@reduxjs/toolkit";

import reducers from "@store/user/reducers";
import { UserStateType, RootState } from "@custom-types/redux.types";

// Начальное состояние
export const initialState: UserStateType = {
  photosCount: 0,
  photos: []
};

// Создание состояния сообщений
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