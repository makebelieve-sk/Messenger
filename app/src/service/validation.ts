import { z } from "zod";
import i18next from "@service/i18n";

// Общая схема объекта пользователя
export const UserSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string().min(1, i18next.t("validation.schema.error.required_firstname")),
    secondName: z.string().nullable(),
    thirdName: z.string().min(1, i18next.t("validation.schema.error.required_thirdname")),
    email: z.string().email(i18next.t("validation.schema.error.incorrect_email")).min(1, i18next.t("validation.schema.error.required_email")),
    phone: z.string().min(1, i18next.t("validation.schema.error.required_phone")),
    avatarUrl: z.string().optional()
});

// Частичная схема объекта пользователя (не полный объект)
export const PartialUserSchema = UserSchema.pick({
    id: true,
    firstName: true,
    thirdName: true,
    avatarUrl: true
});

// Общая схема объекта пользователя в контексте сокет-соединения
export const SocketUserSchema = UserSchema;

// Общая схема объекта сообщения
export const MessageSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().min(1, i18next.t("validation.schema.error.required_user_id")),
    chatId: z.string().min(1, i18next.t("validation.schema.error.required_chat_id")),
    files: z.string().array().optional(),
    type: z.string().min(1, i18next.t("validation.schema.error.required_message_type")),
    createDate: z.date().min(new Date("1980-01-01"), i18next.t("validation.schema.error.required_message_create_date")),
    message: z.string().min(1, i18next.t("validation.schema.error.required_message")),
    isRead: z.number().gte(0)
});

// Общая схема объекта при редактировании сообщения
export const EditMessageSchema = MessageSchema.pick({
    id: true,
    type: true,
    message: true,
    files: true
});

// Общая схема объекта при наборе сообщения в чате
export const NotifyWriteSchema = z.object({
    isWrite: z.boolean(),
    chatId: z.string().min(1, i18next.t("validation.schema.error.required_chat_id")),
    userName: z.string().min(1, i18next.t("validation.schema.error.required_write_username")),
});

// Общая схема объекта пользователя в разделе "Друзья"
export const FriendSchema = z.object({
    type: z.string().min(1, i18next.t("validation.schema.error.required_friend_type")),
    payload: z.object({
        to: z.string().min(1, i18next.t("validation.schema.error.required_friend_id")),
        acceptedFriend: UserSchema.optional()
    })
});