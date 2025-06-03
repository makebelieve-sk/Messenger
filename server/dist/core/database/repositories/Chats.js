"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = __importDefault(require("@core/database/models/chat"));
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
class Chats {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
        this._model = (0, chat_1.default)(this._sequelize);
    }
    get model() {
        return this._model;
    }
    async create({ creationAttributes, transaction }) {
        try {
            return this._model.create(creationAttributes, { transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Chats", method: "create" }) + error.message);
        }
    }
}
exports.default = Chats;
//# sourceMappingURL=Chats.js.map