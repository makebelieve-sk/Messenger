import { createSlice } from "@reduxjs/toolkit";

import reducers from "@store/message/reducers";
import { MessageStateType, RootState } from "@custom-types/redux.types";

// Начальное состояние
export const initialState: MessageStateType = {
  dialogs: [],
  unRead: {},
  messages: [],
  visibleUnReadMessages: null,
  isWrite: {},
  scrollDownAfterNewMsg: false,
  usersInChat: [],
  editMessage: null,
  attachmentsModal: null,
};

// Создание состояния сообщений
export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers,
});

// Состояние
export const selectMessagesState = (state: RootState) => state.messages;

// Экшены
export const {
  setDialogs,
  deleteDialog,
  setMessageObjectFieldInDialog,
  setUnRead,
  setMessage,
  updateMessage,
  setMessages,
  setVisibleUnReadMessages,
  setWriteMessage,
  setScrollDownAfterNewMsg,
  changeLastMessageInDialog,
  setUsersInChat,
  deleteMessage,
  editMessage,
  setEditMessage,
  resetEditMessage,
  setAttachments,
} = messagesSlice.actions;

// Редьюсер
export default messagesSlice.reducer;