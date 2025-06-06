import { serverToClientFriendsSchema as handleFriendsSchema } from "../socket/friends";
import { serverToClientMainSchema as handleMainSchema } from "../socket/main";
import { clientToServerMessagesSchema as emitMessagesSchema, serverToClientMessagesSchema as handleMessagesSchema } from "../socket/messages";
import { serverToClientUsersSchema as handleUsersSchema } from "../socket/users";
import { z } from "zod";

// Общий список схем для отправки событий
export const emitClientEventSchemas = {
	...emitMessagesSchema,
};

// Общий список схем для обработки полученных событий
export const handleClientEventSchemas = {
	...handleUsersSchema,
	...handleMainSchema,
	...handleFriendsSchema,
	...handleMessagesSchema,
};

export type EmitClientEventSchemasType = keyof typeof emitClientEventSchemas;
export type HandleClientEventSchemasType = keyof typeof handleClientEventSchemas;

export type ValidateClientEmitReturnType = z.infer<(typeof emitClientEventSchemas)[EmitClientEventSchemasType]>;
export type ValidateClientHandleReturnType = { success: true } | { success: false; message: string };