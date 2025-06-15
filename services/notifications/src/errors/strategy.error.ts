import BaseError from "src/errors/base.error";
import { ERRORS } from "src/types/enums";
import { HttpStatus } from "@nestjs/common";

// Пользовательская ошибка в работе стратегии нотификации
export default class StrategyError extends BaseError {
	readonly code = ERRORS.STRATEGY_ERROR;
	readonly status = HttpStatus.SERVICE_UNAVAILABLE;

	constructor(
		readonly message: string,
		readonly details?: Object,
	) {
		super(message);
	}
}
