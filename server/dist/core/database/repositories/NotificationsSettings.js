"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_settings_1 = __importDefault(require("@core/database/models/notification-settings"));
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
const DEFAULT_CREATION_ATTRIBUTES = {
    soundEnabled: true,
    messageSound: true,
    friendRequestSound: true,
};
// Репозиторий, который содержит методы по работе с моделью NotificationSettings
class NotificationsSettings {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
        this._model = (0, notification_settings_1.default)(this._sequelize);
    }
    get model() {
        return this._model;
    }
    async create({ userId, transaction }) {
        try {
            const newNotificationSettings = await this._model.create({ ...DEFAULT_CREATION_ATTRIBUTES, userId }, { transaction });
            return newNotificationSettings.getEntity();
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", {
                repo: "NotificationsSettings",
                method: "create",
            }) + error.message);
        }
    }
    async findOneBy({ filters, transaction }) {
        try {
            return await this._model.findOne({ where: filters, transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", {
                repo: "NotificationsSettings",
                method: "findOneBy",
            }) + error.message);
        }
    }
    async destroy({ filters, transaction }) {
        try {
            return this._model.destroy({ where: filters, transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "NotificationsSettings", method: "destroy" }) + error.message);
        }
    }
}
exports.default = NotificationsSettings;
//# sourceMappingURL=NotificationsSettings.js.map