import { z } from "zod";

import { serverToClientFriendsSchema as emitFriendsSchema } from "../socket/friends";
import { serverToClientMainSchema as emitMainSchema } from "../socket/main";
import { serverToClientMessagesSchema as emitMessagesSchema } from "../socket/messages";
import { serverToClientUsersSchema as emitUsersSchema } from "../socket/users";
import { clientToServerMessagesSchema as handleMessagesSchema } from "../socket/messages";

// Общий список схем для отправки событий
export const emitServerEventSchemas = {
	...emitMainSchema,
	...emitUsersSchema,
	...emitFriendsSchema,
	...emitMessagesSchema,
};

// Общий список схем для обработки полученных событий
export const handleServerEventSchemas = {
	...handleMessagesSchema,
};

export type EmitServerEventSchemasType = keyof typeof emitServerEventSchemas;
export type HandleServerEventSchemasType = keyof typeof handleServerEventSchemas;

export type ValidateServerEmitReturnType = z.infer<(typeof emitServerEventSchemas)[EmitServerEventSchemasType]> | false;
export type ValidateServerHandleReturnType = { success: true; } | { success: false; message: string; };