"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const crypto_1 = __importDefault(require("crypto"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const index_1 = require("@errors/index");
const auth_1 = require("@utils/auth");
const constants_1 = require("@utils/constants");
const logger = (0, logger_1.default)("Passport");
// Класс, отвечает за стратегию аутентификации пользователя
class PassportWorks {
    constructor(_app, _database, _users) {
        this._app = _app;
        this._database = _database;
        this._users = _users;
        this._passport = passport_1.default;
        this._init();
    }
    get passport() {
        return this._passport;
    }
    _init() {
        logger.debug("init");
        // Мидлвары авторизации через passport.js
        this._app.use(this._passport.initialize());
        this._app.use(this._passport.session());
        // Локальная стратегия входа пользователя (по логину/паролю)
        this._passport.use(new passport_local_1.Strategy({ usernameField: "login", passwordField: "password" }, this._verify.bind(this)));
        // Достаем данные о пользователе из его сессии при входе
        this._passport.serializeUser((user, done) => {
            logger.info("serializeUser [me=%j]", user);
            process.nextTick(() => {
                if (!this._users.has(user.id)) {
                    this._users.add(user);
                }
                done(null, user.id);
            });
        });
        // Сохраняем данные о пользователе в его сессию при каждом запросе
        this._passport.deserializeUser((userId, done) => {
            logger.debug("deserializeUser [userId=%s]", userId);
            process.nextTick(() => {
                const user = this._users.get(userId);
                if (user) {
                    done(null, user);
                }
                else {
                    this._database.repo.users
                        .getById({ userId })
                        .then(async (foundUser) => {
                        if (foundUser) {
                            // Получаем объект пользователя с аватаром и безопасными полями
                            const user = await this._database.repo.users.getUserWithAvatar({
                                user: foundUser,
                            });
                            /**
                             * Напоминание
                             * На сервере одна общая мапа пользователей
                             * (это список онлайн, то есть те юзеры, которые прошли авторизацию -> значит подключаются к сокету).
                             * В запросах (express) мы не должны использовать идентификатор сокет соединения (он там попросту не нужен).
                             * В обработчиках событий сокет соединения нам необходимо использовать идентификатор сокет соединения.
                             * Поэтому здесь (сериализация устанавливает объект пользователя в объект запроса req.user) мы устанавливаем поле
                             * sockets = new Map(), потому что вскоре после этого действия произойдет установка сокет соединения на клиенте с сервером
                             * и в этот момент произойдет установка sockets на нужный (добавятся сокет-соединения конкретного пользователя).
                             */
                            this._users.add(user);
                            done(null, user);
                        }
                        else {
                            done(new index_1.PassportError((0, i18n_1.t)("users.error.user_with_id_not_found", { id: userId }), common_types_1.HTTPStatuses.NotFound));
                        }
                    })
                        .catch((error) => {
                        const nextError = error instanceof index_1.PassportError ? error : new index_1.PassportError(error.message);
                        done(nextError);
                    });
                }
            });
        });
    }
    // Проверка подлинности пользователя
    async _verify(login, password, done) {
        if (constants_1.IS_DEV) {
            logger.debug("_verify [login=%s, password=%s]", login, password);
        }
        try {
            if (!login || !password) {
                throw new index_1.PassportError((0, i18n_1.t)("auth.error.incorrect_login_or_password"), common_types_1.HTTPStatuses.Unauthorized, { type: common_types_1.HTTPErrorTypes.SIGN_IN });
            }
            const email = (0, auth_1.validateEmail)(login);
            if (email) {
                const candidateEmail = await this._database.repo.users.findOneBy({
                    filters: { email },
                });
                if (candidateEmail) {
                    return await this._comparePasswords(candidateEmail, password, done);
                }
            }
            const phone = (0, auth_1.validatePhoneNumber)(login);
            if (phone) {
                const candidatePhone = await this._database.repo.users.findOneBy({
                    filters: { phone },
                });
                if (candidatePhone) {
                    return await this._comparePasswords(candidatePhone, password, done);
                }
                else {
                    throw new index_1.PassportError((0, i18n_1.t)("auth.error.incorrect_login_or_password"), common_types_1.HTTPStatuses.Unauthorized, { type: common_types_1.HTTPErrorTypes.SIGN_IN });
                }
            }
            throw new index_1.PassportError((0, i18n_1.t)("auth.error.incorrect_login_or_password"), common_types_1.HTTPStatuses.Unauthorized, { type: common_types_1.HTTPErrorTypes.SIGN_IN });
        }
        catch (error) {
            const nextError = error instanceof index_1.PassportError ? error : new index_1.PassportError(error.message);
            done(nextError);
        }
    }
    // Сравнение паролей пользователя (текущего и сохраненного в БД)
    async _comparePasswords(candidate, password, done) {
        if (constants_1.IS_DEV) {
            logger.debug("_comparePasswords [candidate=%s, password=%s]", candidate, password);
        }
        try {
            // Генерируем хеш пароля, приправленным "солью"
            const hashString = await new Promise((resolve, reject) => {
                crypto_1.default.pbkdf2(password, candidate.salt, 4096, 256, "sha256", (error, hash) => {
                    error ? reject(error) : resolve(hash.toString("hex"));
                });
            });
            if (hashString === candidate.password) {
                // Получаем объект пользователя с аватаром и безопасными полями
                const user = await this._database.repo.users.getUserWithAvatar({
                    user: candidate,
                });
                return done(null, user);
            }
            throw new index_1.PassportError((0, i18n_1.t)("auth.error.incorrect_login_or_password"), common_types_1.HTTPStatuses.Unauthorized, { type: common_types_1.HTTPErrorTypes.SIGN_IN });
        }
        catch (error) {
            const nextError = error instanceof index_1.PassportError ? error : new index_1.PassportError(error.message);
            throw nextError;
        }
    }
}
exports.default = PassportWorks;
//# sourceMappingURL=Passport.js.map