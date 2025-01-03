import { HTTPStatuses } from "../types/enums";

export class BaseError extends Error {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError) {
        super(message);

        // Необходимо для корректного наследования имени ошибки от наследуемых "кастомных" классов ошибок
        this.name = this.constructor.name;
        // Необходимо для корректного указания последовательности вызова ошибки
        Error.captureStackTrace(this, this.constructor);

        console.info(this.stack);
    }
}

export class MiddlewareError extends BaseError {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError) {
        super(message, status);

        this.name = "Middleware error";
    }
}

export class PassportError extends BaseError {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError) {
        super(message, status);

        this.name = "Passport error";
    }
}

export class DatabaseError extends BaseError {
    constructor(readonly message: string) {
        super(message);

        this.name = "Database error";
    }
}

export class RedisError extends BaseError {
    constructor(readonly message: string) {
        super(message);

        this.name = "Redis error";
    }
}

export class SocketError extends BaseError {
    constructor(readonly message: string) {
        super(message);

        this.name = "Socket error";
    }
}