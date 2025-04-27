import { z } from "zod";

import { FriendSchema, SocketUserSchema } from "@core/socket/validation/helper";
import i18next from "@service/i18n";
import { SocketActions } from "@custom-types/enums";

// Описание схемы обработки данных событий друзей
export const emitFriendsSchema = {
	[SocketActions.FRIENDS]: FriendSchema,
};

// Описание схемы отправки данных событий друзей
export const handleFriendsSchema = {
	[SocketActions.ADD_TO_FRIENDS]: z.object({}).optional(),
	[SocketActions.ACCEPT_FRIEND]: z.object({ user: SocketUserSchema }),
	[SocketActions.UNSUBSCRIBE]: z.object({}).optional(),
	[SocketActions.BLOCK_FRIEND]: z.object({ userId: z.string().min(1, i18next.t("validation.schema.error.required_user_id")) }),
};
