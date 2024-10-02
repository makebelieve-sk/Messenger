import { BaseError } from ".";
import { ErrorType } from "../types";

export class AuthError extends BaseError {
    constructor(readonly error: ErrorType) {
        super(error);

        this.name = "Auth error";
    }
}

export class FileError extends BaseError {
    constructor(readonly error: ErrorType) {
        super(error);

        this.name = "File error";
    }
}

export class FriendsError extends BaseError {
    constructor(readonly error: ErrorType) {
        super(error);

        this.name = "Friends error";
    }
}

export class MessagesError extends BaseError {
    constructor(readonly error: ErrorType) {
        super(error);

        this.name = "Messages error";
    }
}

export class UsersError extends BaseError {
    constructor(readonly error: ErrorType) {
        super(error);

        this.name = "Users error";
    }
}