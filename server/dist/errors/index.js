"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketError = exports.RedisError = exports.RepositoryError = exports.PassportError = exports.RateLimiterError = exports.MiddlewareError = exports.BaseError = void 0;
const common_types_1 = require("common-types");
const logger_1 = __importDefault(require("@service/logger"));
const constants_1 = require("@utils/constants");
const logger = (0, logger_1.default)("BaseError");
class BaseError extends Error {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError) {
        super(message);
        this.message = message;
        this.status = status;
        // Необходимо для корректного наследования имени ошибки от наследуемых "кастомных" классов ошибок
        this.name = this.constructor.name;
        logger.error(this.stack);
    }
    /**
     * Подход ООП (Полиморфизм). То есть, все классы ошибок наследуются от текущего родительского класса.
     * При этом, некоторые из них (такие как AuthError, PassportError и UsersError) должны вернуть объект с
     * дополнительными опциями (например, некорректные поля) обратно клиенту в запросе.
     * Добавление данного метода в родительский класс позволит реализовать общий метод и переопределить его так,
     * как необходимо в конкретном классе (даже TS не будет ругаться).
     */
    getOptions() {
        return {};
    }
}
exports.BaseError = BaseError;
class MiddlewareError extends BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError) {
        super(message, status);
        this.message = message;
        this.status = status;
        this.name = "Middleware error";
    }
}
exports.MiddlewareError = MiddlewareError;
class RateLimiterError extends BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError) {
        super(message, status);
        this.message = message;
        this.status = status;
        this.name = "Rate limiter error";
    }
}
exports.RateLimiterError = RateLimiterError;
class PassportError extends BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError, _options) {
        super(message, status);
        this.message = message;
        this.status = status;
        this._options = _options;
        this.name = "Passport error";
    }
    getOptions() {
        return this._options;
    }
}
exports.PassportError = PassportError;
class RepositoryError extends BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError) {
        super(message, status);
        this.message = message;
        this.status = status;
        this.name = "Repository error";
    }
}
exports.RepositoryError = RepositoryError;
class RedisError extends BaseError {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "Redis error";
    }
}
exports.RedisError = RedisError;
class SocketError extends BaseError {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "Socket error";
    }
    setMiddlewareError() {
        return new Error(constants_1.SOCKET_MIDDLEWARE_ERROR);
    }
}
exports.SocketError = SocketError;
//# sourceMappingURL=index.js.map