import crypto from "crypto";
import { Request, Response, NextFunction, Express } from "express";
import { v4 as uuid } from "uuid";
import { PassportStatic } from "passport";
import { IVerifyOptions } from "passport-local";

import { updateSessionMaxAge } from "../utils/session";
import { getSafeUserFields } from "../utils/user";
import { UsersType } from "../types";
import { ApiRoutes, ErrorTextsApi, HTTPStatuses, RedisKeys } from "../types/enums";
import { ISafeUser } from "../types/user.types";
import RedisWorks from "../core/Redis";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { AuthError } from "../errors/controllers";
import { PassportError } from "../errors";

const COOKIE_NAME = process.env.COOKIE_NAME as string;

// Класс, отвечающий за API авторизации/аутентификации
export default class AuthController {
    constructor(
        private readonly _app: Express,
        private readonly _middleware: Middleware,
        private readonly _database: Database,
        private readonly _redisWork: RedisWorks,
        private readonly _passport: PassportStatic,
        private readonly _users: UsersType
    ) {
        this._init();
    }

    // Слушатели запросов контроллера AuthController
    private _init() {
        this._app.post(ApiRoutes.signUp, this._isAuthenticated.bind(this), this._signUp.bind(this));
        this._app.post(ApiRoutes.signIn, this._isAuthenticated.bind(this), this._signIn.bind(this));
        this._app.get(ApiRoutes.logout, this._middleware.mustAuthenticated.bind(this._middleware), this._logout.bind(this));
    }

    // Проверяем авторизирован ли пользователь в системе
    private async _isAuthenticated(req: Request, _: Response, next: NextFunction) {
        try {
            if (req.isAuthenticated()) {
                // Получаем поле rememberMe из Redis
                const rememberMe = await this._redisWork.get(RedisKeys.REMEMBER_ME, (req.user as ISafeUser).id);

                // Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
                await updateSessionMaxAge(req.session, Boolean(rememberMe));
    
                return next(new AuthError(ErrorTextsApi.YOU_ALREADY_AUTH, HTTPStatuses.PermanentRedirect));
            }

            next();
        } catch (error) {
            // return необходим для точного возврата ошибки в мидлвар ошибки (так как этот метод и сам является мидлваром только для текущих ендпоинтов)
            return next(error);
        }
    };

    // Регистрация пользователя
    private async _signUp(req: Request, res: Response, next: NextFunction) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { firstName, thirdName, email, phone, password, avatarUrl } = req.body;

            // Проверка на существование почты и телефона
            const checkDublicateEmail = await this._database.models.users.findOne({ where: { email }, transaction });

            if (checkDublicateEmail) {
                return next(new AuthError(`Пользователь с почтовым адресом ${email} уже существует`, HTTPStatuses.BadRequest, { field: "email" }));
            }

            const checkDublicatePhone = await this._database.models.users.findOne({ where: { phone }, transaction });

            if (checkDublicatePhone) {
                return next(new AuthError(`Пользователь с номером телефона ${phone} уже существует`, HTTPStatuses.BadRequest, { field: "phone" }));
            }

            // "Соль"
            const salt = crypto.randomBytes(128);
            const saltString = salt.toString("hex");

            crypto.pbkdf2(password, saltString, 4096, 256, "sha256", (error, hash) => {
                if (error) {
                    return next(new AuthError(error.message));
                }

                // Генерируем хеш пароля, приправленным "солью"
                const hashString = hash.toString("hex");

                this._database.models.users
                    .create({ id: uuid(), firstName, thirdName, email, phone, password: hashString, avatarUrl, salt: saltString }, { transaction })
                    .then(newUser => {
                        if (newUser) {
                            const user = getSafeUserFields(newUser);

                            this._database.models.userDetails
                                .create({ userId: user.id }, { transaction })
                                .then(newUserDetail => {
                                    if (newUserDetail) {
                                        req.login(user, async function (error?: PassportError) {
                                            if (error) {
                                                return next(error);
                                            }

                                            await transaction.commit();

                                            return res.json({ success: true, user });
                                        });
                                    } else {
                                        return next(new AuthError(ErrorTextsApi.ERROR_CREATING_USER_DETAILS));
                                    }
                                })
                                .catch((error: Error) => {
                                    return next(new AuthError(error.message));
                                });
                        } else {
                            return next(new AuthError(ErrorTextsApi.ERROR_CREATING_USER));
                        }
                    })
                    .catch((error: Error) => {
                        return next(new AuthError(error.message));
                    });
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Вход пользователя
    private async _signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const { rememberMe }: { rememberMe: boolean } = req.body;

            this._passport.authenticate("local", { session: true }, async (error: PassportError | null, user: ISafeUser, _?: IVerifyOptions) => {
                if (error) {
                    // Далее обрабатывается глобальным мидлваром на ошибку, поэтому прокидываем просто error
                    return next(error);
                }

                if (!req.sessionID) {
                    return next(new AuthError(ErrorTextsApi.SESSION_ID_NOT_EXISTS))
                }

                req.logIn(user, async (error?: PassportError) => {
                    if (error) {
                        // Далее обрабатывается глобальным мидлваром на ошибку, поэтому прокидываем просто error
                        return next(error);
                    }

                    // Записываем в Redis значение поля rememberMe
                    await this._redisWork.set(RedisKeys.REMEMBER_ME, user.id, JSON.stringify(rememberMe));

                    // Обновляем время жизни записи только в том случае, если пользователь не нажал на "Запомнить меня"
                    if (!rememberMe) {
                        await this._redisWork.expire(RedisKeys.REMEMBER_ME, user.id);
                    }

                    // Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
                    await updateSessionMaxAge(req.session, Boolean(rememberMe));

                    return res.json({ success: true });
                });
            })(req, res, next);
        } catch (error) {
            next(error);
        }
    };

    // Выход пользователя
    private async _logout(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as ISafeUser).id;

            // Выход из passport.js
            req.logout((error?: Error) => {
                if (error) {
                    return next(new AuthError(error.message));
                }

                // Удаляем текущую сессию express.js пользователя
                req.session.destroy(async (error?: Error) => {
                    if (error) {
                        return next(new AuthError(error.message));
                    }

                    if (!req.sessionID) {
                        return next(new AuthError(`Отсутствует идентификатор сессии пользователя (session=${req.session})`));
                    }

                    // Удаляем флаг rememberMe из Redis
                    await this._redisWork.delete(RedisKeys.REMEMBER_ME, userId);

                    // Удаляем пользователя из списка пользователей
                    this._users.delete(userId);

                    // Удаляем session-cookie (sid)
                    return res.clearCookie(COOKIE_NAME).json({ success: true });
                });
            });
        } catch (error) {
            next(error);
        }
    };
};