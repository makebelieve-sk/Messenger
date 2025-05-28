import { type HandleArgsType } from "common-types";

import type { 
    EmitServerEventSchemasType, 
    HandleServerEventSchemasType, 
    ValidateServerEmitReturnType, 
    ValidateServerHandleReturnType 
} from "./server-schemas";
import type {
    EmitClientEventSchemasType,
    HandleClientEventSchemasType,
    ValidateClientEmitReturnType,
    ValidateClientHandleReturnType
} from "./client-schemas";
import { emitServerEventSchemas, handleServerEventSchemas } from "./server-schemas";
import { emitClientEventSchemas, handleClientEventSchemas } from "./client-schemas";

// Функция валидации при попытке отправки события на сервере
export const validateServerEmitEvent = <E extends (...args: any[]) => void>(
    type: EmitServerEventSchemasType | EmitClientEventSchemasType,
    data: HandleArgsType<E>
): ValidateServerEmitReturnType | ValidateClientEmitReturnType => {
    return validateEmitEvent(type, data, emitServerEventSchemas);
};

// Функция валидации при попытке отправки события на клиенте
export const validateClientEmitEvent = <E extends (...args: any[]) => void>(
    type: EmitServerEventSchemasType | EmitClientEventSchemasType,
    data: HandleArgsType<E>
): ValidateServerEmitReturnType | ValidateClientEmitReturnType => {
    console.log(type, data, emitClientEventSchemas)
    return validateEmitEvent(type, data, emitClientEventSchemas);
};

// Функция валидации при попытке отправки события
const validateEmitEvent = <E extends (...args: any[]) => void>(
    type: EmitServerEventSchemasType | EmitClientEventSchemasType,
    data: HandleArgsType<E>,
    emitSchema: typeof emitServerEventSchemas | typeof emitClientEventSchemas
): ValidateServerEmitReturnType | ValidateClientEmitReturnType => {
    const schema = emitSchema[type];
    const result = schema.safeParse(data);

    if (!result.success) {
        throw result.error.errors
            .map(err => `${err.path.join(".")}: ${err.message}`)
            .join(". ");
    }

    return result.data;
};

// Функция валидации при попытке обработки приходящего события на сервере
export const validateServerHandleEvent = <E extends (...args: any[]) => void>(
    event: HandleServerEventSchemasType | HandleClientEventSchemasType,
    data: HandleArgsType<E>
): ValidateServerHandleReturnType | ValidateClientHandleReturnType => {
    return validateHandleEvent(event, data, handleServerEventSchemas);
};

// Функция валидации при попытке обработки приходящего события на клиенте
export const validateClientHandleEvent = <E extends (...args: any[]) => void>(
    event: HandleServerEventSchemasType | HandleClientEventSchemasType,
    data: HandleArgsType<E>
): ValidateServerHandleReturnType | ValidateClientHandleReturnType => {
    return validateHandleEvent(event, data, handleClientEventSchemas);
};

// Функция валидации при попытке обработки приходящего события
const validateHandleEvent = <E extends (...args: any[]) => void>(
    event: HandleServerEventSchemasType | HandleClientEventSchemasType,
    data: HandleArgsType<E>,
    emitSchema: typeof handleServerEventSchemas | typeof handleClientEventSchemas
): ValidateServerHandleReturnType | ValidateClientHandleReturnType => {
    try {
        const schema = emitSchema[event];
        const result = schema.safeParse(data);

        if (!result.success) {
            throw result.error.errors
                .map(err => `${err.path.join(".")}: ${err.message}`)
                .join(". ");
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