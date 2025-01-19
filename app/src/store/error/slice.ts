import { createSlice } from "@reduxjs/toolkit";

import { ErrorStateType, RootState } from "@custom-types/redux.types";
import reducers from "@store/error/reducers";

// Начальное состояние
export const initialState: ErrorStateType = {
  error: null,
  systemError: null,
};

// Создание состояния ошибки
export const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers,
});

// Состояние
export const selectErrorState = (state: RootState) => state.error;

// Экшены
export const { setError, setSystemError } = errorSlice.actions;

// Редьюсер
export default errorSlice.reducer;