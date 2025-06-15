import BaseError from "src/errors/base.error";
import { ERRORS } from "src/types/enums";
import { HttpStatus } from "@nestjs/common";

// Пользовательская ошибка сервиса
export default class AppError extends BaseError {
	readonly code = ERRORS.APP_ERROR;
	readonly status = HttpStatus.SERVICE_UNAVAILABLE;

	constructor(
		readonly message: string,
		readonly details?: Object,
	) {
		super(message);
	}
}
