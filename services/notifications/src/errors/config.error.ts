import BaseError from "src/errors/base.error";
import { ERRORS } from "src/types/enums";
import { HttpStatus } from "@nestjs/common";

// Пользовательская ошибка чтения конфига
export default class ConfigError extends BaseError {
	readonly code = ERRORS.ERROR_CONFIG;
	readonly status = HttpStatus.SERVICE_UNAVAILABLE;

	constructor(
		readonly message: string,
		readonly details?: Object,
	) {
		super(message);
	}
}
