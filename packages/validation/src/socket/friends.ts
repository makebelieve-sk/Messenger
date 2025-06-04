import { SocketActions } from "common-types";
import { z } from "zod";

import { SocketUserSchema } from "../base/user";

// Описание схемы событий друзей, отправленных с сервера на клиент
export const serverToClientFriendsSchema = {
    [SocketActions.FOLLOW_FRIEND]: z.object({ user: SocketUserSchema }),
    [SocketActions.ADD_OUTGOING_REQUEST]: z.object({ user: SocketUserSchema }),
    [SocketActions.UNFOLLOW_FRIEND]: z.object({ user: SocketUserSchema }),
    [SocketActions.REMOVE_OUTGOING_REQUEST]: z.object({ user: SocketUserSchema }),
    [SocketActions.ADD_TO_FRIEND]: z.object({ user: SocketUserSchema }),
    [SocketActions.REMOVE_FOLLOWER]: z.object({ user: SocketUserSchema }),
    [SocketActions.ADD_FRIEND_REQUEST]: z.object({ user: SocketUserSchema }),
    [SocketActions.REMOVE_FRIEND_REQUEST]: z.object({ user: SocketUserSchema }),
    [SocketActions.REJECT_FRIEND_REQUEST]: z.object({ userId: z.string() }),
    [SocketActions.ADD_TO_FOLLOWER]: z.object({ user: SocketUserSchema }),
    [SocketActions.DELETE_FRIEND]: z.object({ user: SocketUserSchema }),
    [SocketActions.DELETING_FRIEND]: z.object({ user: SocketUserSchema }),
    [SocketActions.BLOCK_FRIEND]: z.object({ userId: z.string() }),
    [SocketActions.BLOCKING_FRIEND]: z.object({ user: SocketUserSchema }),
    [SocketActions.UNBLOCK_FRIEND]: z.object({ user: SocketUserSchema }),
    [SocketActions.UNBLOCKING_FRIEND]: z.object({ user: SocketUserSchema }),
}; 