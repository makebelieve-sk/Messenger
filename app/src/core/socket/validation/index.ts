import { HandleArgsType } from "common-types";
import {
	type EmitClientEventSchemasType,
	type HandleClientEventSchemasType,
	validateClientEmitEvent,
	validateClientHandleEvent,
} from "validation";

import type { ClientToServerEvents, ServerToClientEvents } from "@custom-types/socket.types";

export type ValidateHandleReturnType = ReturnType<typeof validateClientHandleEvent>;

type ValidateEmitEventType = (
	type: EmitClientEventSchemasType, 
	data: HandleArgsType<ClientToServerEvents[EmitClientEventSchemasType]>
) => ReturnType<typeof validateClientEmitEvent>;

type ValidateHandleEventType = (
	type: HandleClientEventSchemasType, 
	data?: HandleArgsType<ServerToClientEvents[HandleClientEventSchemasType]>
) => ValidateHandleReturnType;

// Функция валидации при попытке отправки события
export const validateEmitEvent: ValidateEmitEventType = (event, data) => {
	try {
		return validateClientEmitEvent<ClientToServerEvents[EmitClientEventSchemasType]>(event, data);
	} catch (error) {
		const nextError = error instanceof Error ? error : new Error(error as string);

		throw nextError.message;
	}
};

// Функция валидации при попытке обработки приходящего события
export const validateHandleEvent: ValidateHandleEventType = (event, data) => {
	return validateClientHandleEvent<ServerToClientEvents[HandleClientEventSchemasType]>(event, data);
};