import BaseError from "src/errors/base.error";
import { ERRORS } from "src/types/enums";
import { HttpStatus } from "@nestjs/common";

// Пользовательская ошибка в работе базы данных
export default class DatabaseError extends BaseError {
	readonly code = ERRORS.DATABASE_ERROR;
	readonly status = HttpStatus.SERVICE_UNAVAILABLE;

	constructor(
		readonly message: string,
		readonly details?: Object,
	) {
		super(message);
	}
}
