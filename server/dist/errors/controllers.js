"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersError = exports.MessagesError = exports.FriendsError = exports.FilesError = exports.ImagesError = exports.AuthError = exports.MainError = void 0;
const common_types_1 = require("common-types");
const index_1 = require("@errors/index");
class MainError extends index_1.BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError) {
        super(message, status);
        this.message = message;
        this.status = status;
        this.name = "Main error";
    }
}
exports.MainError = MainError;
class AuthError extends index_1.BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError, _options) {
        super(message, status);
        this.message = message;
        this.status = status;
        this._options = _options;
        this.name = "Authenticated error";
    }
    getOptions() {
        return this._options;
    }
}
exports.AuthError = AuthError;
class ImagesError extends index_1.BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError) {
        super(message, status);
        this.message = message;
        this.status = status;
        this.name = "Images error";
    }
}
exports.ImagesError = ImagesError;
class FilesError extends index_1.BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError) {
        super(message, status);
        this.message = message;
        this.status = status;
        this.name = "Files error";
    }
}
exports.FilesError = FilesError;
class FriendsError extends index_1.BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError) {
        super(message, status);
        this.message = message;
        this.status = status;
        this.name = "Friends error";
    }
}
exports.FriendsError = FriendsError;
class MessagesError extends index_1.BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError) {
        super(message, status);
        this.message = message;
        this.status = status;
        this.name = "Messages error";
    }
}
exports.MessagesError = MessagesError;
class UsersError extends index_1.BaseError {
    constructor(message, status = common_types_1.HTTPStatuses.ServerError, _options) {
        super(message, status);
        this.message = message;
        this.status = status;
        this._options = _options;
        this.name = "Users error";
    }
    getOptions() {
        return this._options;
    }
}
exports.UsersError = UsersError;
//# sourceMappingURL=controllers.js.map