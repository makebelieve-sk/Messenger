import { SocketActions } from "common-types";
import { z } from "zod";

// Описание схемы событий пользователя, отправленных с сервера на клиент
export const serverToClientMainSchema = {
    [SocketActions.SOCKET_CHANNEL_ERROR]: z.object({ message: z.string().min(1) }),
}; 