import { ErrorType } from "../types";
import { HTTPStatuses } from "../types/enums";

export class BaseError extends Error {
    readonly status: HTTPStatuses;

    constructor(readonly error: ErrorType) {
        super((error as Error).message ?? error);

        this.status = HTTPStatuses.ServerError;
        console.error(error);
    }
}

export class MiddlewareError extends BaseError {
    constructor(readonly error: ErrorType) {
        super(error);

        this.name = "Middleware error";
    }
}

export class PassportError extends BaseError {
    constructor(readonly error: ErrorType) {
        super(error);

        this.name = "Passport error";
    }
}

export class SocketError extends BaseError {
    constructor(readonly error: ErrorType) {
        super(error);

        this.name = "Socket error";
    }
}