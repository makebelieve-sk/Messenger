"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_message_status_1 = __importDefault(require("@core/database/models/user-message-status"));
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
// Репозиторий, который содержит методы по работе с моделью UserMessageStatus
class UserMessageStatuses {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
        this._model = (0, user_message_status_1.default)(this._sequelize);
    }
    get model() {
        return this._model;
    }
    async create({ creationAttributes, transaction }) {
        try {
            return this._model.create(creationAttributes, { transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserMessageStatuses", method: "create" }) + error.message);
        }
    }
    async destroy({ filters, transaction }) {
        try {
            return this._model.destroy({ where: filters, transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserMessageStatuses", method: "destroy" }) + error.message);
        }
    }
}
exports.default = UserMessageStatuses;
//# sourceMappingURL=UserMessageStatuses.js.map