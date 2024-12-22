import { HTTPStatuses } from "../types/enums";

export class BaseError extends Error {
    constructor(readonly message: string) {
        super(message);

        this.name = "Base error";
        console.error(message);
        console.info(this.stack);
    }
}

export class MiddlewareError extends BaseError {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError) {
        super(message);

        this.name = "Middleware error";
    }
}

export class PassportError extends BaseError {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError) {
        super(message);

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