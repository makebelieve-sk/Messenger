import { SocketActions } from "common-types";
import { z } from "zod";

import { EditMessageSchema, MessageSchema, NotifyWriteSchema } from "../base/message";
import { PartialUserSchema } from "../base/user";

// Описание схемы событий сообщений, отправленных с клиента на сервер
export const clientToServerMessagesSchema = {
    [SocketActions.MESSAGE]: z.object({ data: MessageSchema, usersInChat: z.array(PartialUserSchema) }),
    [SocketActions.DELETE_MESSAGE]: z.object({
        companionId: z.string().min(1),
        messageId: z.string().min(1),
    }),
    [SocketActions.DELETE_CHAT]: z.object({
        chatId: z.string().min(1),
        companionId: z.string().min(1),
    }),
    [SocketActions.EDIT_MESSAGE]: z.object({
        data: EditMessageSchema,
        usersInChat: z.array(PartialUserSchema),
    }),
    [SocketActions.CHANGE_READ_STATUS]: z.object({
        isRead: z.number().gte(0),
        messages: z.array(MessageSchema),
    }),
    [SocketActions.NOTIFY_WRITE]: z.object({
        isWrite: z.boolean(),
        chatId: z.string().min(1),
        usersInChat: z.array(PartialUserSchema),
    }),
};

// Описание схемы событий сообщений, отправленных с сервера на клиент
export const serverToClientMessagesSchema = {
    [SocketActions.SEND_MESSAGE]: z.object({ message: MessageSchema }),
    [SocketActions.DELETE_MESSAGE]: z.object({ messageId: z.string().min(1) }),
    [SocketActions.DELETE_CHAT]: z.object({ chatId: z.string().min(1) }),
    [SocketActions.EDIT_MESSAGE]: z.object({ data: EditMessageSchema }),
    [SocketActions.ACCEPT_CHANGE_READ_STATUS]: z.object({ message: MessageSchema }),
    [SocketActions.NOTIFY_WRITE]: NotifyWriteSchema,
}; 