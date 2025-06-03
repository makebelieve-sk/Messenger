"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const sequelize_1 = require("sequelize");
const photo_1 = __importDefault(require("@core/database/models/photo"));
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
const associations_1 = __importDefault(require("@utils/associations"));
const files_1 = require("@utils/files");
;
// Репозиторий, который содержит методы по работе с моделью Photo
class Photos {
    constructor(_repo) {
        this._repo = _repo;
        this._model = (0, photo_1.default)(this._repo.sequelize);
    }
    get model() {
        return this._model;
    }
    async create({ userId, photoPath, transaction }) {
        try {
            const photoCreation = await (0, files_1.getPhotoInfo)(photoPath);
            const newPhoto = await this._model.create({ ...photoCreation, userId }, { transaction });
            return newPhoto.getEntity();
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Photos", method: "create" }) + error.message);
        }
    }
    async bulkCreate({ photos, transaction }) {
        try {
            return await this._model.bulkCreate(photos, {
                transaction,
                returning: true,
            });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", {
                repo: "Photos",
                method: "bulkCreate",
            }) + error.message);
        }
    }
    async getById({ photoId, transaction }) {
        try {
            return await this._model.findByPk(photoId, { transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Photos", method: "getById" }) + error.message);
        }
    }
    async getUserPhotos({ filters, options, transaction }) {
        try {
            const totalPhotos = await this._model.count({
                where: filters,
                include: [
                    {
                        model: this._repo.users.model,
                        as: associations_1.default.PHOTOS_WITH_USER,
                        through: {
                            where: { userId: filters.userId },
                        },
                        attributes: [],
                        required: true,
                    },
                ],
                transaction,
            });
            const where = filters;
            if (options.lastCreatedDate) {
                where.createdAt = {
                    [sequelize_1.Op.lt]: options.lastCreatedDate,
                };
            }
            const foundPhotos = await this._model.findAll({
                where,
                limit: options.limit,
                transaction,
                include: [
                    {
                        model: this._repo.users.model,
                        as: associations_1.default.PHOTOS_WITH_USER,
                        through: {
                            where: { userId: filters.userId },
                        },
                        attributes: [],
                        required: true,
                    },
                ],
                order: [["createdAt", "DESC"], ["id", "DESC"]],
            });
            return {
                photos: foundPhotos.map(foundPhoto => foundPhoto.getEntity()),
                count: totalPhotos,
            };
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Photos", method: "getUserPhotos" }) + error.message);
        }
    }
    async destroy({ filters, transaction }) {
        try {
            await this._model.destroy({ where: filters, transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Photos", method: "destroy" }) + error.message);
        }
    }
    async returnDestroyedRow({ filters, transaction }) {
        try {
            const destroyedRow = await this._model.findOne({
                where: filters,
                transaction,
            });
            if (!destroyedRow) {
                throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.destroyed_row_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            await this.destroy({ filters, transaction });
            return destroyedRow.id;
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Photos", method: "returnDestroyedRow" }) + error.message);
        }
    }
}
exports.default = Photos;
//# sourceMappingURL=Photos.js.map