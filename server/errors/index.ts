import Logger from "@service/logger";
import { HTTPErrorTypes, HTTPStatuses } from "@custom-types/enums";
import { SOCKET_MIDDLEWARE_ERROR } from "@utils/constants";

const logger = Logger("BaseError");

export class BaseError extends Error {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
	) {
		super(message);

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
	getOptions(): Object | undefined {
		return {};
	}
}

export class MiddlewareError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
	) {
		super(message, status);

		this.name = "Middleware error";
	}
}

export class RateLimiterError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
	) {
		super(message, status);

		this.name = "Rate limiter error";
	}
}

export class PassportError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
		private readonly _options?: { [key: string]: HTTPErrorTypes },
	) {
		super(message, status);

		this.name = "Passport error";
	}

	getOptions() {
		return this._options;
	}
}

export class RepositoryError extends BaseError {
	constructor(
		readonly message: string,
		readonly status: HTTPStatuses = HTTPStatuses.ServerError,
	) {
		super(message, status);

		this.name = "Repository error";
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

	setMiddlewareError() {
		return new Error(SOCKET_MIDDLEWARE_ERROR);
	}
}
