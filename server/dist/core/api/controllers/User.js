"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const controllers_1 = require("@errors/controllers");
const auth_1 = require("@utils/auth");
const logger = (0, logger_1.default)("UserController");
const NOT_REQUIRED_EDIT_INFO_FIELDS = ["sex", "birthday", "work", "city"];
;
// Класс, отвечающий за API пользователей
class UserController {
    constructor(_app, _middleware, _database) {
        this._app = _app;
        this._middleware = _middleware;
        this._database = _database;
        this._init();
    }
    // Слушатели запросов контроллера UserController
    _init() {
        this._app.get(common_types_1.ApiRoutes.getMe, this._middleware.mustAuthenticated.bind(this._middleware), this._getMe.bind(this));
        this._app.post(common_types_1.ApiRoutes.getUser, this._middleware.mustAuthenticated.bind(this._middleware), this._getUser.bind(this));
        this._app.put(common_types_1.ApiRoutes.editInfo, this._middleware.mustAuthenticated.bind(this._middleware), this._editInfo.bind(this));
    }
    // Получение данных о себе
    async _getMe(req, res, next) {
        logger.debug("_getMe");
        const transaction = await this._database.sequelize.transaction();
        try {
            if (!req.user) {
                throw new controllers_1.UsersError((0, i18n_1.t)("users.error.user_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            const user = req.user;
            // Получение дополнительной информации и общих звуковых настроек пользователя
            const { userDetails, notificationSettings } = await this._database.repo.populateUser({ userId: user.id, transaction });
            await transaction.commit();
            res.json({
                success: true,
                user,
                userDetails: userDetails.getEntity(),
                notificationSettings: notificationSettings.getEntity(),
            });
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    // Получение данных о другом пользователе (при загрузке другого профиля)
    async _getUser(req, res, next) {
        logger.debug("_getUser [req.body=%j]", req.body);
        const transaction = await this._database.sequelize.transaction();
        try {
            const { id } = req.body;
            if (!id) {
                throw new controllers_1.UsersError((0, i18n_1.t)("users.error.user_id_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            const foundUser = await this._database.repo.users.getById({ userId: id, transaction });
            if (!foundUser) {
                throw new controllers_1.UsersError((0, i18n_1.t)("users.error.user_with_id_not_found", { id }), common_types_1.HTTPStatuses.NotFound);
            }
            // Получаем объект пользователя с аватаром и безопасными полями
            const user = await this._database.repo.users.getUserWithAvatar({
                user: foundUser,
            });
            const userDetails = await this._database.repo.userDetails.getById({ userId: id, transaction });
            if (!userDetails) {
                throw new controllers_1.UsersError((0, i18n_1.t)("users.error.user_with_id_not_found", { id }), common_types_1.HTTPStatuses.NotFound);
            }
            await transaction.commit();
            res.json({ success: true, user, userDetails: userDetails.getEntity() });
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    // Изменение информации о пользователе
    async _editInfo(req, res, next) {
        logger.debug("_editInfo [req.body=%j]", req.body);
        const transaction = await this._database.sequelize.transaction();
        try {
            const fields = req.body;
            const { id: userId } = req.user;
            // Формируем те поля из объекта req.body, которые остались пусты
            const missingFields = Object.entries(fields)
                .filter(([key, value]) => !value && !NOT_REQUIRED_EDIT_INFO_FIELDS.includes(key))
                .map(([key]) => key);
            // Проверка обязательных полей пользователя
            if (missingFields.length) {
                throw new controllers_1.UsersError((0, i18n_1.t)("users.error.edit_incorrect_data", { fields: missingFields.join(", ") }), common_types_1.HTTPStatuses.BadRequest, {
                    type: common_types_1.HTTPErrorTypes.EDIT_INFO,
                    fields: missingFields,
                });
            }
            const { name, surName, sex, birthday, work, city, phone, email } = fields;
            // Валидация введенной почты
            const validationEmail = (0, auth_1.validateEmail)(email);
            if (!validationEmail) {
                throw new controllers_1.UsersError((0, i18n_1.t)("users.error.edit_incorrect_format", { fields: "email" }), common_types_1.HTTPStatuses.BadRequest, {
                    type: common_types_1.HTTPErrorTypes.EDIT_INFO,
                    field: "email",
                });
            }
            // Валидация введенного номера телефона
            const validationPhone = (0, auth_1.validatePhoneNumber)(phone);
            if (!validationPhone) {
                throw new controllers_1.UsersError((0, i18n_1.t)("users.error.edit_incorrect_format", { fields: "phone" }), common_types_1.HTTPStatuses.BadRequest, {
                    type: common_types_1.HTTPErrorTypes.EDIT_INFO,
                    field: "phone",
                });
            }
            const foundUser = await this._database.repo.users.getById({
                userId,
                transaction,
            });
            if (!foundUser) {
                throw new controllers_1.UsersError((0, i18n_1.t)("users.error.user_with_id_not_found", { id: userId }), common_types_1.HTTPStatuses.NotFound);
            }
            // Обновляем поля пользователя
            Object.assign(foundUser, {
                email: validationEmail,
                phone: validationPhone,
                firstName: name,
                thirdName: surName,
            });
            await foundUser.save({ transaction });
            const foundUserDetails = await this._database.repo.userDetails.findOneBy({
                filters: { userId },
                transaction,
            });
            if (!foundUserDetails) {
                throw new controllers_1.UsersError((0, i18n_1.t)("users.error.user_details_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            // Обновляем поля доп. информации о пользователе
            Object.assign(foundUserDetails, {
                sex: sex === "" ? null : sex,
                birthday,
                work,
                city,
            });
            await foundUserDetails.save({ transaction });
            await transaction.commit();
            res.json({
                success: true,
                user: foundUser.getEntity(),
                userDetails: foundUserDetails.getEntity(),
            });
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
}
exports.default = UserController;
//# sourceMappingURL=User.js.map