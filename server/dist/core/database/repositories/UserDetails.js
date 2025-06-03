"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_detail_1 = __importDefault(require("@core/database/models/user-detail"));
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
// Репозиторий, который содержит методы по работе с моделью UserDetails
class UserDetails {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
        this._model = (0, user_detail_1.default)(this._sequelize);
    }
    get model() {
        return this._model;
    }
    async create({ creationAttributes, transaction }) {
        try {
            const newUserDetails = await this._model.create(creationAttributes, {
                transaction,
            });
            return newUserDetails.getEntity();
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserDetails", method: "create" }) + error.message);
        }
    }
    async getById({ userId, transaction }) {
        try {
            return await this._model.findByPk(userId, { transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserDetails", method: "getById" }) + error.message);
        }
    }
    async findOneBy({ filters, transaction }) {
        try {
            return await this._model.findOne({ where: filters, transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserDetails", method: "findOneBy" }) + error.message);
        }
    }
    async updateLastSeen(userId, lastSeen = null) {
        try {
            await this._model.update({ lastSeen }, { where: { userId } });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserDetails", method: "updateLastSeen" }) + error.message);
        }
    }
    async destroy({ filters, transaction }) {
        try {
            await this._model.destroy({ where: filters, transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserDetails", method: "destroy" }) + error.message);
        }
    }
}
exports.default = UserDetails;
//# sourceMappingURL=UserDetails.js.map