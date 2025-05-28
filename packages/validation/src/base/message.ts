import { z } from "zod";

// Общая схема объекта сообщения
export const MessageSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().min(1),
    chatId: z.string().min(1),
    files: z.string().array().optional(),
    type: z.string().min(1),
    createDate: z.date().min(new Date("1980-01-01")),
    message: z.string().min(1),
    isRead: z.number().gte(0),
});

// Общая схема объекта при редактировании сообщения
export const EditMessageSchema = MessageSchema.pick({
    id: true,
    type: true,
    message: true,
    files: true,
});

// Общая схема объекта при наборе сообщения в чате
export const NotifyWriteSchema = z.object({
    isWrite: z.boolean(),
    chatId: z.string().min(1),
    userName: z.string().min(1),
}); 