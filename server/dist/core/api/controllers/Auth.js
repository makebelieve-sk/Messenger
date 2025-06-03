"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const crypto_1 = __importDefault(require("crypto"));
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const controllers_1 = require("@errors/controllers");
const enums_1 = require("@custom-types/enums");
const constants_1 = require("@utils/constants");
const session_1 = require("@utils/session");
const logger = (0, logger_1.default)("AuthController");
const NOT_REQUIRED_SIGN_UP_FIELDS = ["avatarUrl", "photoUrl"];
// Класс, отвечающий за API авторизации/аутентификации
class AuthController {
    constructor(_app, _middleware, _database, _redisWork, _passport, _users) {
        this._app = _app;
        this._middleware = _middleware;
        this._database = _database;
        this._redisWork = _redisWork;
        this._passport = _passport;
        this._users = _users;
        AuthController.redisWork = this._redisWork;
        AuthController.users = this._users;
        this._init();
    }
    // Слушатели запросов контроллера AuthController
    _init() {
        this._app.post(common_types_1.ApiRoutes.signUp, this._isAuthenticated.bind(this), this._signUp.bind(this));
        this._app.post(common_types_1.ApiRoutes.signIn, this._isAuthenticated.bind(this), this._signIn.bind(this));
        this._app.get(common_types_1.ApiRoutes.logout, this._middleware.mustAuthenticated.bind(this._middleware), this._logout.bind(this));
    }
    // Проверяем авторизирован ли пользователь в системе
    async _isAuthenticated(req, _, next) {
        logger.debug("_isAuthenticated");
        try {
            if (req.isAuthenticated()) {
                // Получаем поле rememberMe из Redis
                const rememberMe = await this._redisWork.get(enums_1.RedisKeys.REMEMBER_ME, req.user.id);
                // Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
                await (0, session_1.updateSessionMaxAge)(req.session, Boolean(rememberMe));
                throw new controllers_1.AuthError((0, i18n_1.t)("auth.error.you_already_auth"), common_types_1.HTTPStatuses.PermanentRedirect);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    }
    // Регистрация пользователя
    async _signUp(req, res, next) {
        logger.debug("_signUp, [body=%j]", req.body);
        const transaction = await this._database.sequelize.transaction();
        try {
            const fields = req.body;
            // Формируем те поля из объекта req.body, которые остались пусты
            const missingFields = Object.entries(fields)
                .filter(([key, value]) => !value && !NOT_REQUIRED_SIGN_UP_FIELDS.includes(key))
                .map(([key]) => key);
            // Проверка обязательных полей объекта регистрации
            if (missingFields.length) {
                throw new controllers_1.AuthError((0, i18n_1.t)("auth.error.missing_fields", { fields: missingFields.join(", ") }), common_types_1.HTTPStatuses.BadRequest, {
                    type: common_types_1.HTTPErrorTypes.SIGN_UP,
                    fields: missingFields,
                });
            }
            const { firstName, thirdName, email, phone, password, avatarUrl, photoUrl } = fields;
            // Проверка на существование почты и телефона
            const checkDublicateEmail = await this._database.repo.users.findOneBy({
                filters: { email },
                transaction,
            });
            if (checkDublicateEmail) {
                throw new controllers_1.AuthError((0, i18n_1.t)("auth.error.user_with_email_already_exists", { email }), common_types_1.HTTPStatuses.Conflict, {
                    type: common_types_1.HTTPErrorTypes.SIGN_UP,
                    field: "email",
                });
            }
            const checkDublicatePhone = await this._database.repo.users.findOneBy({
                filters: { phone },
                transaction,
            });
            if (checkDublicatePhone) {
                throw new controllers_1.AuthError((0, i18n_1.t)("auth.error.user_with_phone_already_exists", { phone }), common_types_1.HTTPStatuses.Conflict, {
                    type: common_types_1.HTTPErrorTypes.SIGN_UP,
                    field: "phone",
                });
            }
            // "Соль"
            const salt = crypto_1.default.randomBytes(128);
            const saltString = salt.toString("hex");
            /**
             * Генерируем хеш пароля, приправленным "солью"
             * Важный момент! Даже зная про синхронный метод crypto.pbkdf2Sync все равно лучше оставить так,
             * потому что асинхронный метод никогда не заблокирует поток выполнения.
             */
            const hashString = await new Promise((resolve, reject) => {
                crypto_1.default.pbkdf2(password, saltString, 4096, 256, "sha256", (error, hash) => {
                    error ? reject(error) : resolve(hash.toString("hex"));
                });
            });
            const createdUserData = await this._database.repo.users.create({
                creationAttributes: {
                    firstName,
                    thirdName,
                    email,
                    phone,
                    password: hashString,
                    salt: saltString,
                },
                avatarOptions: {
                    avatarUrl,
                    photoUrl,
                },
                transaction,
            });
            if (!createdUserData) {
                throw new controllers_1.AuthError((0, i18n_1.t)("auth.error.creating_user"));
            }
            const { user, userDetails, notificationSettings } = createdUserData;
            /**
             * Используем обертку над асинхронным методом для того, чтобы подождать результат выполнения и
             * корректно обработать ошибку (работает также, как promisify из пакета node.util)
             */
            await new Promise((resolve, reject) => {
                req.login(user, async (error) => {
                    error ? reject(error) : resolve(true);
                });
            });
            await transaction.commit();
            res.status(common_types_1.HTTPStatuses.Created).json({ success: true, user, userDetails, notificationSettings });
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    // Вход пользователя
    async _signIn(req, res, next) {
        logger.debug("_signIn, [body=%j]", req.body);
        const transaction = await this._database.sequelize.transaction();
        try {
            const { rememberMe } = req.body;
            const user = await new Promise((resolve, reject) => {
                this._passport.authenticate("local", { session: true }, (error, user) => {
                    // Если ошибка, то она только PassportError, значит просто прокидываем ее во внешний catch как есть
                    if (error)
                        return reject(error);
                    if (!req.sessionID)
                        return reject(new controllers_1.AuthError((0, i18n_1.t)("auth.error.session_id_not_exists")));
                    resolve(user);
                })(req, res, next);
            });
            // Получаем пользователя из Passport.js (он уже типа ISafeUser)
            await new Promise((resolve, reject) => {
                req.logIn(user, (error) => {
                    error ? reject(error) : resolve(user);
                });
            });
            // Записываем в Redis значение поля rememberMe
            await this._redisWork.set(enums_1.RedisKeys.REMEMBER_ME, user.id, JSON.stringify(rememberMe));
            // Обновляем время жизни записи только в том случае, если пользователь не нажал на "Запомнить меня"
            if (!rememberMe) {
                await this._redisWork.expire(enums_1.RedisKeys.REMEMBER_ME, user.id);
            }
            // Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
            await (0, session_1.updateSessionMaxAge)(req.session, Boolean(rememberMe));
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
    // Выход пользователя
    async _logout(req, res, next) {
        try {
            logger.debug("_logout [userId=%s]", req.user.id);
            // Выход из текущей сессии
            const socketNotification = await AuthController.logout(req);
            // Уведомляем собственные подключения о выходе
            await socketNotification();
            // Удаляем session-cookie (sid)
            res.status(common_types_1.HTTPStatuses.NoContent).clearCookie(constants_1.COOKIE_NAME).end();
        }
        catch (error) {
            next(error);
        }
    }
    // Статичный метод выхода. Он статичен, так как будет использоваться в другом классе контроллере (см. MainController)
    static async logout(req) {
        const { id: userId } = req.user;
        if (!req.sessionID) {
            throw new controllers_1.AuthError((0, i18n_1.t)("auth.error.session_id_not_exists_on_deleted_session", {
                session: req.session.toString(),
            }));
        }
        // Выход из passport.js
        await new Promise((resolve, reject) => {
            req.logout((error) => {
                error ? reject(new controllers_1.AuthError(error.message)) : resolve(true);
            });
        });
        // Удаляем текущую сессию express.js пользователя
        await new Promise((resolve, reject) => {
            req.session.destroy((error) => {
                error ? reject(new controllers_1.AuthError(error.message)) : resolve(true);
            });
        });
        // Удаляем флаг rememberMe из Redis
        await AuthController.redisWork.delete(enums_1.RedisKeys.REMEMBER_ME, userId);
        return async () => {
            // Получаем из списка пользователей текущего пользователя
            const logoutingUser = AuthController.users.get(userId);
            if (!logoutingUser) {
                throw new controllers_1.AuthError((0, i18n_1.t)("auth.error.user_not_exists"), common_types_1.HTTPStatuses.NotFound);
            }
            // Получаем сокет-контроллер текущего пользователя
            const socketController = Array.from(logoutingUser.sockets.values())[0];
            // Отправляем событие пользователю о выходе (всем его открытым вкладкам)
            await socketController.sendTo(common_types_1.SocketActions.LOG_OUT, {}, userId);
        };
    }
}
exports.default = AuthController;
//# sourceMappingURL=Auth.js.map