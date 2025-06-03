"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const sequelize_1 = require("sequelize");
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
;
// Определяем тип ошибки и настраиваем сообщение/статус
function checkErrorType(sequelizeError) {
    switch (true) {
        case sequelizeError instanceof sequelize_1.ValidationError:
            return {
                message: (0, i18n_1.t)("errors.sequelize.validation_error") + sequelizeError.errors.map(e => e.message).join(", "),
                status: common_types_1.HTTPStatuses.BadRequest,
            };
        case sequelizeError instanceof sequelize_1.UniqueConstraintError:
            return {
                message: (0, i18n_1.t)("errors.sequelize.duplicate_entry") + sequelizeError.errors.map(e => e.message).join(", "),
                status: common_types_1.HTTPStatuses.Conflict,
            };
        case sequelizeError instanceof sequelize_1.DatabaseError:
            return {
                message: (0, i18n_1.t)("errors.sequelize.database_operation_failed") + sequelizeError.parent.message,
                status: common_types_1.HTTPStatuses.ServerError,
            };
        case sequelizeError instanceof sequelize_1.ForeignKeyConstraintError:
            return {
                message: (0, i18n_1.t)("errors.sequelize.foreign_key_constraint_failed"),
                status: common_types_1.HTTPStatuses.Conflict,
            };
        case sequelizeError instanceof sequelize_1.TimeoutError:
            return {
                message: (0, i18n_1.t)("errors.sequelize.database_timeout"),
                status: common_types_1.HTTPStatuses.ServiceUnavailable,
            };
        default:
            return {
                message: (0, i18n_1.t)("errors.sequelize.database_error"),
                status: common_types_1.HTTPStatuses.ServerError,
            };
    }
}
class SequelizeError extends index_1.BaseError {
    constructor(_sequelizeError, message) {
        const errorObject = checkErrorType(_sequelizeError);
        const messageError = message + errorObject.message;
        super(messageError, errorObject.status);
        this._sequelizeError = _sequelizeError;
        this.name = "SequelizeError";
        // Сохраняем стек оригинальной ошибки + текущий
        this.stack = `${this.stack}\n[Caused by] ${this._sequelizeError.stack}`;
    }
}
exports.default = SequelizeError;
;
//# sourceMappingURL=sequelize.js.map