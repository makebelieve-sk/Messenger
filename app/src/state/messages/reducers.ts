import { PayloadAction } from "@reduxjs/toolkit";
// import { IDialog, UserPartial } from "../../pages/messages";
import { IFile, IMessage } from "../../types/models.types";
import { MessageType } from "./slice";
import { UnReadTypes } from "../../types/enums";
import { IEditMessage } from "../../core/edit-message";

interface IUnRead {
    chatId: string; 
};
interface IUnReadPayloadTypeAddChat extends IUnRead {
    messageIds: string[];
};
interface IUnReadPayloadTypeAddMessage extends IUnRead {
    messageId: string;
};
interface IUnReadPayloadTypeRemoveChat extends IUnRead {};
interface IUnReadPayloadTypeRemoveMessage extends IUnRead {
    messageIds: string[];
};
type PayloadUnReadType = IUnReadPayloadTypeAddChat | IUnReadPayloadTypeAddMessage | IUnReadPayloadTypeRemoveChat | IUnReadPayloadTypeRemoveMessage;

export default {
    // Устанавливаем диалоги
    setDialogs: (state: MessageType, action: PayloadAction<any[]>) => {
        const dialogs = action.payload;

        state.dialogs = !dialogs || !dialogs.length
            ? []
            : [...state.dialogs, ...dialogs];
    },
    // Удаление чата
    deleteDialog: (state: MessageType, action: PayloadAction<string>) => {
        const findChat = state.dialogs.find(dialog => dialog.id === action.payload);

        if (findChat) {
            const indexOf = state.dialogs.indexOf(findChat);

            if (indexOf >= 0) {
                state.dialogs.splice(indexOf, 1);
            }
        }
    },
    // Устанавливаем значение полю messageObject в диалоге
    setMessageObjectFieldInDialog: (state: MessageType, action: PayloadAction<{ chatId: string; field: string; value: boolean | string; }>) => {
        const { chatId, field, value } = action.payload;

        const findDialog = state.dialogs.find(dialog => dialog.id === chatId);

        if (findDialog) {
            findDialog.messageObject[field] = value;
        }
    },
    // Установка непрочитанных сообщений
    setUnRead: (state: MessageType, action: PayloadAction<{ type: UnReadTypes; payload?: PayloadUnReadType }>) => {
        const { type, payload } = action.payload;

        switch (type) {
            // Добавление непрочитанных сообщений у чата
            case UnReadTypes.ADD_CHAT: {
                const { chatId, messageIds } = payload as IUnReadPayloadTypeAddChat;

                state.unRead = {
                    ...state.unRead,
                    [chatId]: messageIds
                };

                break;
            };

            // Установка непрочитанного сообщения у чата (если чата в списке нет - происходит его запись)
            case UnReadTypes.ADD_MESSAGE: {
                const { chatId, messageId } = payload as IUnReadPayloadTypeAddMessage;

                const isChatExists = state.unRead.hasOwnProperty(chatId);

                if (isChatExists) {
                    state.unRead[chatId].push(messageId);
                } else {
                    state.unRead[chatId] = [ messageId ];
                }

                break;
            };

            // Удаление всех непрочитанных сообщений у чата (прочитали разом все сообщения)
            case UnReadTypes.REMOVE_CHAT: {
                const { chatId } = payload as IUnReadPayloadTypeRemoveChat;

                const isChatExists = state.unRead.hasOwnProperty(chatId);

                if (isChatExists) {
                    delete state.unRead[chatId];
                }

                break;
            };

            // Удаление непрочитанных сообщений у чата (при скролле)
            case UnReadTypes.REMOVE_MESSAGES: {
                const { chatId, messageIds } = payload as IUnReadPayloadTypeRemoveMessage;

                const isChatExists = state.unRead.hasOwnProperty(chatId);

                if (isChatExists) {
                    const restUnReadMessages = state.unRead[chatId].filter(messageId => !messageIds.includes(messageId));

                    // Если непрочитанных сообщений не осталось, то удаляем чат из состояния
                    if (restUnReadMessages.length) {
                        state.unRead[chatId] = restUnReadMessages;
                    } else {
                        delete state.unRead[chatId];
                    }
                }

                break;
            };

            // Обнуление всех чатов при отсутствии диалогов
            case UnReadTypes.RESET: {
                state.unRead = {};

                break;
            };

            default: {
                console.log("Неизвестный тип непрочитанных сообщений: ", type);
                break;
            };
        };
    },
    // Установка сообщения и установка плашки "Непрочитанные сообщения"
    setMessage: (state: MessageType, action: PayloadAction<{ message: IMessage, showUnreadDie?: boolean, userId?: string }>) => {
        const { message, showUnreadDie, userId } = action.payload;
        const messageId = message.id;

        const findMessage = state.messages.find(message => message.id.toLowerCase() === messageId.toLowerCase());

        if (!findMessage) {
            state.messages = [...state.messages, message];

            state.scrollDownAfterNewMsg = true;
        }

        // Если непрочитанных сообщений не было и сейчас в чате появляется новое сообщение от другого собеседника, то показываем плашку "Непрочитанные сообщения"
        if (!state.visibleUnReadMessages && showUnreadDie) {
            // Находим первое непрочитанное сообщение, и чтобы я не был автором этого сообщения
            const firstUnreadMessage = state.messages.find(message => !message.isRead && userId && message.userId !== userId);

            state.visibleUnReadMessages = firstUnreadMessage
                ? firstUnreadMessage.id
                : null;
        }
    },
    // Обновляем конкретное значение сообщения 
    updateMessage: (state: MessageType, action: PayloadAction<{ messageId: string; field: string; value: number }>) => {
        const { messageId, field, value } = action.payload;

        const findMessage = state.messages.find(message => message.id.toLowerCase() === messageId.toLowerCase());

        if (findMessage && findMessage[field] !== value) {
            findMessage[field] = value;
        }
    },
    // Установка сообщений чата
    setMessages: (state: MessageType, action: PayloadAction<{ messages: IMessage[], userId?: string }>) => {
        const { messages, userId } = action.payload;

        state.messages = !messages || !messages.length
            ? []
            : [...messages, ...state.messages];

        const unreadMessages = state.messages.filter(message => !message.isRead && userId && message.userId !== userId);

        if (unreadMessages && unreadMessages.length) {
            // Находим первое непрочитанное сообщение, и чтобы я не был автором этого сообщения
            const firstUnreadMessage = unreadMessages[0];

            // Записываем id первого непрочитанного сообщения (необходимо для отображения плашки "Непрочитанные сообщения")
            if (firstUnreadMessage) {
                state.visibleUnReadMessages = firstUnreadMessage.id;
            }
        }
    },
    // Установка значения плашки "Непрочитанные сообщения"
    setVisibleUnReadMessages: (state: MessageType, action: PayloadAction<string | null>) => {
        state.visibleUnReadMessages = action.payload;
    },
    // Сохраняем, какой пользователь в каком чате набирает сообщение
    setWriteMessage: (state: MessageType, action: PayloadAction<{ isWrite: boolean; chatId: string; userName: string; }>) => {
        const { isWrite, chatId, userName } = action.payload;

        if (isWrite) {
            state.isWrite[chatId] = [];
            state.isWrite[chatId].push(userName);
        } else {
            const writingUsers = state.isWrite[chatId];

            if (writingUsers && writingUsers.length > 1) {
                const indexOf = writingUsers.indexOf(userName);

                if (indexOf >= 0) {
                    writingUsers.splice(indexOf, 1);
                }
            } else {
                delete state.isWrite[chatId];
            }
        }
    },
    // Скроллим вниз после нового сообщения
    setScrollDownAfterNewMsg: (state: MessageType, action: PayloadAction<boolean>) => {
        state.scrollDownAfterNewMsg = action.payload;
    },
    // Установка последнего сообщения в диалогах
    changeLastMessageInDialog: (state: MessageType, action: PayloadAction<IMessage>) => {
        const { id, chatId, message, createDate, type, Call, files, authorAvatar } = action.payload;

        if (chatId) {
            const findDialog = state.dialogs.find(dialog => dialog.id === chatId);

            if (findDialog) {
                const indexOf = state.dialogs.indexOf(findDialog);

                if (indexOf >= 0) {
                    state.dialogs[indexOf].messageObject = {
                        call: Call,
                        createDate,
                        files: files as IFile[],
                        message,
                        type,
                        messageAuthor: {
                            id: id,
                            avatarUrl: authorAvatar as string
                        },
                        chatSoundStatus: findDialog.messageObject.chatSoundStatus
                    }
                }
            }
        }
    },
    // Установка пользователей в открытый чат
    setUsersInChat: (state: MessageType, action: PayloadAction<any[]>) => {
        state.usersInChat = action.payload;
    },
    // Удаление сообщения из списка сообщений в конкретном чате
    deleteMessage: (state: MessageType, action: PayloadAction<string>) => {
        const findMessage = state.messages.find(message => message.id === action.payload);

        if (findMessage) {
            const indexOf = state.messages.indexOf(findMessage);

            if (indexOf >= 0) {
                state.messages.splice(indexOf, 1);
            }
        }
    },
    // Редактирование сообщения в списке сообщений
    editMessage: (state: MessageType, action: PayloadAction<IEditMessage>) => {
        const { id, files, message } = action.payload;

        const findMessage = state.messages.find(message => message.id === id);

        if (findMessage) {
            const indexOf = state.messages.indexOf(findMessage);

            if (indexOf >= 0) {
                findMessage.message = message;
                findMessage.files = files;

                state.messages.splice(indexOf, 1, findMessage);
            }
        }
    },
    // Установка редактируемого сообщения
    setEditMessage: (state: MessageType, action: PayloadAction<IMessage>) => {
        state.editMessage = action.payload;
    },
    // Обнуление редактируемого сообщения
    resetEditMessage: (state: MessageType) => {
        state.editMessage = null;
    },
    // Показ модального окна с вложениями чата
    setAttachments: (state: MessageType, action: PayloadAction<{ chatId: string; isOpen: boolean; } | null>) => {
        state.attachmentsModal = action.payload;
    },
};