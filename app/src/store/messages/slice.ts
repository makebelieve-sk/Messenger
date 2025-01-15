import { createSlice } from "@reduxjs/toolkit";
import reducers from "./reducers";
import { InitialStateType, RootState } from "../../types/redux.types";

export type MessageType = Pick<
  InitialStateType, 
  "dialogs" | "unRead" | "messages" | "visibleUnReadMessages" | "isWrite" | "scrollDownAfterNewMsg" | "usersInChat" | "editMessage" | "attachmentsModal"
>;

// Начальное состояние
export const initialState: MessageType = {
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