import { z } from "zod";

import { SocketActions } from "../../../../types/enums";
import { SocketUserSchema } from "../../../../service/validation";
import { t } from "../../../../service/i18n";

// Описание схемы отправки данных событий пользователя
export const emitUsersSchema = {
    [SocketActions.GET_ALL_USERS]: z.object({ users: z.array(SocketUserSchema) }),
    [SocketActions.GET_NEW_USER]: z.object({ user: SocketUserSchema }),
    [SocketActions.USER_DISCONNECT]: z.object({ userId: z.string().min(1, t("validation.schema.error.required_user_id")) })
}