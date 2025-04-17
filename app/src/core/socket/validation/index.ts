import { z } from "zod";

import { emitFriendsSchema, handleFriendsSchema } from "@core/socket/validation/schemas/friends";
import { handleMainSchema } from "@core/socket/validation/schemas/main";
import { emitMessagesSchema, handleMessagesSchema } from "@core/socket/validation/schemas/messages";
import { handleUsersSchema } from "@core/socket/validation/schemas/users";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import { ClientToServerEvents, HandleArgsType, ServerToClientEvents } from "@custom-types/socket.types";

const logger = Logger.init("Validation:Socket");

// Общий список схем для отправки событий
const emitEventSchemas = {
	...emitFriendsSchema,
	...emitMessagesSchema,
};

// Общий список схем для обработки полученных событий
const handleEventSchemas = {
	...handleUsersSchema,
	...handleMainSchema,
	...handleFriendsSchema,
	...handleMessagesSchema,
};

type EmitEventSchemasType = keyof typeof emitEventSchemas;
type ValidateEmitReturnType = z.infer<(typeof emitEventSchemas)[EmitEventSchemasType]>;

type ValidateEmitEventType = (type: EmitEventSchemasType, data: HandleArgsType<ClientToServerEvents[EmitEventSchemasType]>) => ValidateEmitReturnType;

// Функция валидации при попытке отправки события
export const validateEmitEvent: ValidateEmitEventType = (event, data) => {
	try {
		logger.info(i18next.t("validation.socket.emit_event", { event }));

		const schema = emitEventSchemas[event];

		if (!schema) {
			throw i18next.t("validation.socket.error.emit_unknown_event", { event });
		}

		const result = schema.safeParse(data);

		if (!result.success) {
			throw result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(". ");
		}

		return result.data;
	} catch (error) {
		const nextError = error instanceof Error ? error : new Error(error as string);

		throw nextError.message;
	}
};

type HandleEventSchemasType = keyof typeof handleEventSchemas;
export type ValidateHandleReturnType = { success: true } | { success: false; message: string };

type ValidateHandleEventType = (type: HandleEventSchemasType, data?: HandleArgsType<ServerToClientEvents[HandleEventSchemasType]>) => ValidateHandleReturnType;

// Функция валидации при попытке обработки приходящего события
export const validateHandleEvent: ValidateHandleEventType = (event, data) => {
	try {
		logger.info(i18next.t("validation.socket.handle_event", { event }));

		const schema = handleEventSchemas[event];

		if (!schema) {
			throw i18next.t("validation.socket.error.handle_unknown_event", { event });
		}

		const result = schema.safeParse(data);

		if (!result.success) {
			throw result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(". ");
		}

		return { success: true };
	} catch (error) {
		const nextError = error instanceof Error ? error : new Error(error as string);

		return {
			success: false,
			message: nextError.message,
		};
	}
};
