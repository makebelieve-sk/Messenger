import { z } from "zod";

import { SocketUserSchema } from "@core/socket/validation/helper";
import i18next from "@service/i18n";
import { SocketActions } from "@custom-types/enums";

// Описание схемы отправки данных событий пользователя
export const handleUsersSchema = {
	[SocketActions.GET_ALL_USERS]: z.object({ users: z.array(SocketUserSchema) }),
	[SocketActions.GET_NEW_USER]: z.object({ user: SocketUserSchema }),
	[SocketActions.USER_DISCONNECT]: z.object({ userId: z.string().min(1, i18next.t("validation.schema.error.required_user_id")) }),
	[SocketActions.LOG_OUT]: z.object({}).optional(),
};
