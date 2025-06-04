import { SocketActions } from "common-types";
import { z } from "zod";

import { SocketUserSchema } from "../base/user";

// Описание схемы событий пользователя, отправленных с сервера на клиент
export const serverToClientUsersSchema = {
    [SocketActions.GET_ALL_USERS]: z.object({ users: z.array(SocketUserSchema) }),
    [SocketActions.GET_NEW_USER]: z.object({ user: SocketUserSchema }),
    [SocketActions.USER_DISCONNECT]: z.object({ userId: z.string().min(1) }),
    [SocketActions.LOG_OUT]: z.object({}).optional(),
}; 