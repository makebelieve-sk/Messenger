import { z } from "zod";

import { SocketUserSchema } from "@core/socket/validation/helper";
import { t } from "@service/i18n";
import { SocketActions } from "@custom-types/enums";

// Описание схемы отправки данных событий пользователя
export const emitUsersSchema = {
	[SocketActions.GET_ALL_USERS]: z.object({ users: z.array(SocketUserSchema) }),
	[SocketActions.GET_NEW_USER]: z.object({ user: SocketUserSchema }),
	[SocketActions.USER_DISCONNECT]: z.object({
		userId: z.string().min(1, t("validation.schema.error.required_user_id")),
	}),
	[SocketActions.LOG_OUT]: z.object({}).optional(),
};
