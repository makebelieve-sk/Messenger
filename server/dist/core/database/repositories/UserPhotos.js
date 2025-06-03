"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_photo_1 = __importDefault(require("@core/database/models/user-photo"));
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
// Репозиторий, который содержит методы по работе с моделью UserPhoto
class UserPhotos {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
        this._model = (0, user_photo_1.default)(this._sequelize);
    }
    get model() {
        return this._model;
    }
    async create({ creationAttributes, transaction }) {
        try {
            return await this._model.create(creationAttributes, { transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserPhotos", method: "create" }) + error.message);
        }
    }
    async bulkCreate({ records, transaction }) {
        try {
            return await this._model.bulkCreate(records, { transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserPhotos", method: "bulkCreate" }) + error.message);
        }
    }
    async destroy({ filters, transaction }) {
        try {
            await this._model.destroy({ where: filters, transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "UserPhotos", method: "destroy" }) + error.message);
        }
    }
}
exports.default = UserPhotos;
//# sourceMappingURL=UserPhotos.js.map