import EventEmitter from "events";
import crypto from "crypto";
import { Request, Response, NextFunction, Express } from "express";
import { v4 as uuid } from "uuid";
import { PassportStatic } from "passport";
import { IVerifyOptions } from "passport-local";
import { Transaction } from "sequelize";

import { updateSessionMaxAge } from "../utils/session";
import { getSaveUserFields } from "../utils/user";
import { UsersType } from "../types";
import { ApiRoutes, HTTPStatuses, RedisKeys } from "../types/enums";
import { IUser } from "../types/models.types";
import { ApiServerEvents } from "../types/events";
import RedisWorks from "../core/Redis";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { AuthError } from "../errors/controllers";
import { PassportError } from "../errors";
import { ISaveUser } from "../database/models/Users";
import { t } from "../service/i18n";

const COOKIE_NAME = process.env.COOKIE_NAME as string;

interface IConstructor {
    app: Express;
    redisWork: RedisWorks;
    middleware: Middleware;
    database: Database;
    passport: PassportStatic;
    users: UsersType;
};

export default class AuthController extends EventEmitter {
    private readonly _app: Express;
    private readonly _redisWork: RedisWorks;
    private readonly _middleware: Middleware;
    private readonly _database: Database;
    private readonly _passport: PassportStatic;
    private readonly _users: UsersType;

    constructor({ app, redisWork, middleware, database, passport, users }: IConstructor) {
        super();

        this._app = app;
        this._redisWork = redisWork;
        this._middleware = middleware;
        this._database = database;
        this._passport = passport;
        this._users = users;

        this._init();
    }

    // Слушатели запросов контроллера AuthController
    private _init() {
        this._app.post(ApiRoutes.signUp, this._isAuthenticated.bind(this), this._signUp.bind(this));
        this._app.post(ApiRoutes.signIn, this._isAuthenticated.bind(this), this._signIn.bind(this));
        this._app.get(ApiRoutes.logout, this._middleware.mustAuthenticated.bind(this._middleware), this._logout.bind(this));
    }

    // Обработка ошибки
    private async _handleError(error: unknown, res: Response, transaction?: Transaction) {
        if (transaction) await transaction.rollback();

        this.emit(ApiServerEvents.ERROR, { error, res });
    }

    // Проверяем авторизирован ли пользователь в системе
    private async _isAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.isAuthenticated()) {
                // Получаем поле rememberMe из Redis
                const rememberMe = await this._redisWork.get(RedisKeys.REMEMBER_ME, (req.user as IUser).id);

                // Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
                await updateSessionMaxAge(req.session, Boolean(rememberMe));
    
                throw new AuthError(t("you_already_auth"), HTTPStatuses.PermanentRedirect);
            }

            next();
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Регистрация пользователя
    private async _signUp(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { firstName, thirdName, email, phone, password, avatarUrl } = req.body;

            // Проверка на существование почты и телефона
            const checkDublicateEmail = await this._database.models.users.findOne({ where: { email }, transaction });

            if (checkDublicateEmail) {
                throw new AuthError(t("user_with_email_already_exists", { email }), HTTPStatuses.BadRequest, { field: "email" });
            }

            const checkDublicatePhone = await this._database.models.users.findOne({ where: { phone }, transaction });

            if (checkDublicatePhone) {
                throw new AuthError(t("user_with_phone_already_exists", { phone }), HTTPStatuses.BadRequest, { field: "phone" });
            }

            // "Соль"
            const salt = crypto.randomBytes(128);
            const saltString = salt.toString("hex");

            crypto.pbkdf2(password, saltString, 4096, 256, "sha256", (error, hash) => {
                if (error) {
                    throw new AuthError(error.message);
                }

                // Генерируем хеш пароля, приправленным "солью"
                const hashString = hash.toString("hex");

                this._database.models.users
                    .create({ id: uuid(), firstName, thirdName, email, phone, password: hashString, avatarUrl, salt: saltString }, { transaction })
                    .then(newUser => {
                        if (newUser) {
                            const user = getSaveUserFields(newUser);

                            this._database.models.userDetails
                                .create({ userId: user.id }, { transaction })
                                .then(newUserDetail => {
                                    if (newUserDetail) {
                                        req.login(user, async function (error?: PassportError) {
                                            if (error) {
                                                throw error;
                                            }

                                            await transaction.commit();

                                            return res.json({ success: true, user });
                                        });
                                    } else {
                                        throw new AuthError(t("error_creating_user_details"));
                                    }
                                })
                                .catch((error: Error) => {
                                    throw new AuthError(error.message);
                                });
                        } else {
                            throw new AuthError(t("error_creating_user"));
                        }
                    })
                    .catch((error: Error) => {
                        throw new AuthError(error.message);
                    });
            });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Вход пользователя
    private async _signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const { rememberMe }: { rememberMe: boolean } = req.body;

            this._passport.authenticate("local", { session: true }, async (error: PassportError | null, user: ISaveUser, _?: IVerifyOptions) => {
                if (error) {
                    throw new AuthError(error.message, error.status);
                }

                if (!req.sessionID) {
                    throw new AuthError(t("session_id_not_exists"));
                }

                return req.logIn(user, async (error?: PassportError) => {
                    if (error) {
                        throw new AuthError(error.message);
                    }

                    // Записываем в Redis значение поля rememberMe
                    await this._redisWork.set(RedisKeys.REMEMBER_ME, user.id, JSON.stringify(rememberMe));

                    // Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
                    await updateSessionMaxAge(req.session, Boolean(rememberMe));

                    return res.json({ success: true });
                });
            })(req, res, next);
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Выход пользователя
    private async _logout(req: Request, res: Response) {
        try {
            const userId = (req.user as IUser).id;

            // Выход из passport.js
            req.logout((error?: Error) => {
                if (error) {
                    throw new AuthError(error.message);
                }

                // Удаляем текущую сессию express.js пользователя
                req.session.destroy(async (error?: Error) => {
                    if (error) {
                        throw new AuthError(error.message);
                    }

                    if (!req.sessionID) {
                        throw new AuthError(t("session_id_not_exists_on_deleted_session", { session: req.session.toString() }));
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
            this._handleError(error, res);
        }
    };
};