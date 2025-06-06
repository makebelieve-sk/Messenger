import { z } from "zod";

// Общая схема объекта пользователя
export const UserSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string().min(1),
    secondName: z.string().nullable(),
    thirdName: z.string().min(1),
    email: z.string().email().min(1),
    phone: z.string().min(1),
    avatarUrl: z.string().optional(),
    avatarCreateDate: z.union([z.string(), z.date()]).optional(),
    isDeleted: z.boolean(),
});

// Частичная схема объекта пользователя (не полный объект)
export const PartialUserSchema = UserSchema.pick({
    id: true,
    firstName: true,
    thirdName: true,
    avatarUrl: true,
});

// Общая схема объекта пользователя в контексте сокет-соединения
export const SocketUserSchema = UserSchema.extend({
    sockets: z.any().optional()
});