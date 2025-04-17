import { BaseError } from "@errors/index";
import { HTTPErrorTypes, HTTPStatuses } from "@custom-types/enums";

export class AuthError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
		private readonly _options?: {
			type: HTTPErrorTypes;
			field?: string;
			fields?: string[];
		},
	) {
		super(message, status);

		this.name = "Authenticated error";
	}

	getOptions() {
		return this._options;
	}
}

export class ImagesError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
	) {
		super(message, status);

		this.name = "Images error";
	}
}

export class FilesError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
	) {
		super(message, status);

		this.name = "Files error";
	}
}

export class FriendsError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
	) {
		super(message, status);

		this.name = "Friends error";
	}
}

export class MessagesError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
	) {
		super(message, status);

		this.name = "Messages error";
	}
}

export class UsersError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
		private readonly _options?: { type: HTTPErrorTypes; fields?: string[]; field?: string; },
	) {
		super(message, status);

		this.name = "Users error";
	}

	getOptions() {
		return this._options;
	}
}
