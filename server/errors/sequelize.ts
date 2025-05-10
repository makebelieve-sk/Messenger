import { DatabaseError, type Error, ForeignKeyConstraintError, TimeoutError, UniqueConstraintError, ValidationError } from "sequelize";

import { t } from "@service/i18n";
import { BaseError } from "@errors/index";
import { HTTPStatuses } from "@custom-types/enums";

interface IErrorObject {
    message: string;
    status: number;
};

// Определяем тип ошибки и настраиваем сообщение/статус
function checkErrorType(sequelizeError: Error): IErrorObject {
	switch (true) {
	case sequelizeError instanceof ValidationError:
		return {
			message: t("errors.sequelize.validation_error") + sequelizeError.errors.map(e => e.message).join(", "),
			status: HTTPStatuses.BadRequest,
		};
	case sequelizeError instanceof UniqueConstraintError:
		return {
			message: t("errors.sequelize.duplicate_entry") + sequelizeError.errors.map(e => e.message).join(", "),
			status: HTTPStatuses.Conflict,
		};
	case sequelizeError instanceof DatabaseError:
		return {
			message: t("errors.sequelize.database_operation_failed") + sequelizeError.parent.message,
			status: HTTPStatuses.ServerError,
		};
	case sequelizeError instanceof ForeignKeyConstraintError:
		return {
			message: t("errors.sequelize.foreign_key_constraint_failed"),
			status: HTTPStatuses.Conflict,
		};
	case sequelizeError instanceof TimeoutError:
		return {
			message: t("errors.sequelize.database_timeout"),
			status: HTTPStatuses.ServiceUnavailable,
		};
	default:
		return {
			message: t("errors.sequelize.database_error"),
			status: HTTPStatuses.ServerError,
		};
	}
}

export default class SequelizeError extends BaseError {
	constructor(private readonly _sequelizeError: Error, message: string) {
		const errorObject = checkErrorType(_sequelizeError);
		const messageError = message + errorObject.message;

		super(messageError, errorObject.status);

		this.name = "SequelizeError";

		// Сохраняем стек оригинальной ошибки + текущий
		this.stack = `${this.stack}\n[Caused by] ${this._sequelizeError.stack}`;
	}
};