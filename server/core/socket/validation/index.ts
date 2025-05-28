import { HandleArgsType } from "common-types";
import {
	type EmitServerEventSchemasType,
	type HandleServerEventSchemasType,
	validateServerEmitEvent,
	validateServerHandleEvent,
} from "validation";

import type { ClientToServerEvents, ServerToClientEvents } from "@custom-types/socket.types";

export type ValidateHandleReturnType = ReturnType<typeof validateServerHandleEvent>;

type ValidateEmitEventType = (
	handleError: (errors: string) => void,
	type: EmitServerEventSchemasType,
	data: HandleArgsType<ServerToClientEvents[EmitServerEventSchemasType]>,
) => ReturnType<typeof validateServerEmitEvent>;

type ValidateHandleEventType = (
	type: HandleServerEventSchemasType, 
	data: HandleArgsType<ClientToServerEvents[HandleServerEventSchemasType]>
) => ValidateHandleReturnType;

// Функция валидации при попытке отправки события
export const validateEmitEvent: ValidateEmitEventType = (handleError, event, data) => {
	try {
		return validateServerEmitEvent<ServerToClientEvents[EmitServerEventSchemasType]>(event, data);
	} catch (error) {
		const nextError = error instanceof Error ? error : new Error(error as string);

		handleError(nextError.message);
		return false;
	}
};

// Функция валидации при попытке обработки приходящего события
export const validateHandleEvent: ValidateHandleEventType = (event, data) => {
	return validateServerHandleEvent<ClientToServerEvents[HandleServerEventSchemasType]>(event, data);
};
