"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_MIDDLEWARE_ERROR = exports.getFullName = void 0;
const logger_1 = __importDefault(require("@service/logger"));
const logger = (0, logger_1.default)("utils");
// Получить полное имя пользователя (Имя + Фамилия)
const getFullName = (user) => {
    logger.debug("getFullName [user=%j]", user);
    return user.firstName + " " + user.thirdName;
};
exports.getFullName = getFullName;
exports.SOCKET_MIDDLEWARE_ERROR = "SOCKET_MIDDLEWARE_ERROR";
//# sourceMappingURL=index.js.map