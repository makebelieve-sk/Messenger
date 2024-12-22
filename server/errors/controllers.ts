import { BaseError } from ".";
import { HTTPStatuses } from "../types/enums";

export class AuthError extends BaseError {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError, readonly options?: { [key: string]: string }) {
        super(message);

        this.name = "Authenticated error";
    }
}

export class FileError extends BaseError {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError) {
        super(message);

        this.name = "File error";
    }
}

export class FriendsError extends BaseError {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError) {
        super(message);

        this.name = "Friends error";
    }
}

export class MessagesError extends BaseError {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError) {
        super(message);

        this.name = "Messages error";
    }
}

export class UsersError extends BaseError {
    constructor(readonly message: string, readonly status: HTTPStatuses = HTTPStatuses.ServerError) {
        super(message);

        this.name = "Users error";
    }
}