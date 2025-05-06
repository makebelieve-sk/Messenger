import { SocketActions } from "common-types";
import { z } from "zod";

import { EditMessageSchema, MessageSchema, NotifyWriteSchema, PartialUserSchema } from "@core/socket/validation/helper";
import { t } from "@service/i18n";

// Описание схемы отправки данных событий чатов
export const emitMessagesSchema = {
	[SocketActions.SEND_MESSAGE]: z.object({ message: MessageSchema }),
	[SocketActions.DELETE_MESSAGE]: z.object({
		messageId: z.string().min(1, t("validation.schema.error.required_message_id")),
	}),
	[SocketActions.DELETE_CHAT]: z.object({
		chatId: z.string().min(1, t("validation.schema.error.required_chat_id")),
	}),
	[SocketActions.EDIT_MESSAGE]: z.object({ data: EditMessageSchema }),
	[SocketActions.ACCEPT_CHANGE_READ_STATUS]: z.object({
		message: MessageSchema,
	}),
	[SocketActions.NOTIFY_WRITE]: NotifyWriteSchema,
};

// Описание схемы обработки данных событий чатов
export const handleMessagesSchema = {
	[SocketActions.MESSAGE]: z.object({
		data: MessageSchema,
		usersInChat: PartialUserSchema.array(),
	}),
	[SocketActions.DELETE_MESSAGE]: z.object({
		companionId: z.string().min(1, t("validation.schema.error.required_companion_id")),
		messageId: z.string().min(1, t("validation.schema.error.required_message_id")),
	}),
	[SocketActions.DELETE_CHAT]: z.object({
		chatId: z.string().min(1, t("validation.schema.error.required_chat_id")),
		companionId: z.string().min(1, t("validation.schema.error.required_companion_id")),
	}),
	[SocketActions.EDIT_MESSAGE]: z.object({
		data: EditMessageSchema,
		usersInChat: PartialUserSchema.array(),
	}),
	[SocketActions.CHANGE_READ_STATUS]: z.object({
		isRead: z.number().gte(0),
		messages: MessageSchema.array(),
	}),
	[SocketActions.NOTIFY_WRITE]: z.object({
		isWrite: z.boolean(),
		chatId: z.string().min(1, t("validation.schema.error.required_chat_id")),
		usersInChat: PartialUserSchema.array(),
	}),
};
