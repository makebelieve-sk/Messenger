"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHandleEvent = exports.validateEmitEvent = void 0;
const validation_1 = require("validation");
// Функция валидации при попытке отправки события
const validateEmitEvent = (handleError, event, data) => {
    try {
        return (0, validation_1.validateServerEmitEvent)(event, data);
    }
    catch (error) {
        const nextError = error instanceof Error ? error : new Error(error);
        handleError(nextError.message);
        return false;
    }
};
exports.validateEmitEvent = validateEmitEvent;
// Функция валидации при попытке обработки приходящего события
const validateHandleEvent = (event, data) => {
    return (0, validation_1.validateServerHandleEvent)(event, data);
};
exports.validateHandleEvent = validateHandleEvent;
//# sourceMappingURL=index.js.map