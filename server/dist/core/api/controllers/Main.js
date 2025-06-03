"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const Auth_1 = __importDefault(require("@core/api/controllers/Auth"));
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const controllers_1 = require("@errors/controllers");
const constants_1 = require("@utils/constants");
const logger = (0, logger_1.default)("MainController");
// Класс, отвечающий за основное/внешнее API
class MainController {
    constructor(_app, _middleware, _database) {
        this._app = _app;
        this._middleware = _middleware;
        this._database = _database;
        this._init();
    }
    // Слушатели запросов контроллера MainController
    _init() {
        this._app.get(common_types_1.ApiRoutes.checkHealth, this._checkHealth);
        this._app.get(common_types_1.ApiRoutes.deleteAccount, this._middleware.mustAuthenticated.bind(this._middleware), this._deleteAccount.bind(this));
        this._app.put(common_types_1.ApiRoutes.soundNotifications, this._middleware.mustAuthenticated.bind(this._middleware), this._soundNotifications.bind(this));
    }
    /**
     * Проверка "здоровья" сервера.
     * Используется в основном для получения информации о том, что сервер запущен и работает без критичных ошибок.
     */
    async _checkHealth(_, res, next) {
        try {
            logger.debug("_checkHealth success");
            res.status(common_types_1.HTTPStatuses.NoContent).end();
        }
        catch (error) {
            next(error);
        }
    }
    // Удаление аккаунта пользователя
    async _deleteAccount(req, res, next) {
        const transaction = await this._database.sequelize.transaction();
        try {
            const { id: userId } = req.user;
            logger.debug("_deleteAccount [userId=%s]", userId);
            // Сначала необходимо удалить текущую сессию и выйти со всех вкладок и браузеров
            const socketNotification = await Auth_1.default.logout(req);
            // Удаляем все записи об учетной записи пользователя
            await this._database.repo.deleteUser({ userId, transaction });
            // Уведомляем собственные подключения о выходе после выполнения всех удалений в базе данных
            await socketNotification();
            await transaction.commit();
            res.status(common_types_1.HTTPStatuses.NoContent).clearCookie(constants_1.COOKIE_NAME).end();
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    // Обновление звуковых уведомлений пользователя
    async _soundNotifications(req, res, next) {
        const transaction = await this._database.sequelize.transaction();
        try {
            logger.debug("_soundNotifications");
            const { userId, soundEnabled, messageSound, friendRequestSound } = req.body;
            const notificationsSound = await this._database.repo.notificationsSettings.findOneBy({
                filters: { userId },
                transaction,
            });
            if (!notificationsSound) {
                throw new controllers_1.MainError((0, i18n_1.t)("main.error.users_notifications_not_found"));
            }
            notificationsSound.soundEnabled = soundEnabled;
            notificationsSound.messageSound = messageSound;
            notificationsSound.friendRequestSound = friendRequestSound;
            await notificationsSound.save({ transaction });
            await transaction.commit();
            res.json({ success: true });
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
}
exports.default = MainController;
//# sourceMappingURL=Main.js.map