import crypto from "crypto";
import { Request, Response, NextFunction, Express } from "express";
import { v4 as uuid } from "uuid";
import { PassportStatic } from "passport";

import { getExpiredToken } from "../utils/token";
import { getSaveUserFields } from "../utils/user";
import { ApiRoutes, ErrorTextsApi, HTTPStatuses, RedisKeys } from "../types/enums";
import { IUser } from "../types/models.types";
import RedisWorks from "../core/Redis";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { AuthError } from "../errors/controllers";

const COOKIE_NAME = process.env.COOKIE_NAME as string;

interface IConstructor {
    app: Express;
    redisWork: RedisWorks;
    middleware: Middleware;
    database: Database;
    passport: PassportStatic;
};

export default class AuthController {
    private readonly _app: Express;
    private readonly _redisWork: RedisWorks;
    private readonly _middleware: Middleware;
    private readonly _database: Database;
    private readonly _passport: PassportStatic;

    constructor({ app, redisWork, middleware, database, passport }: IConstructor) {
        this._app = app;
        this._redisWork = redisWork;
        this._middleware = middleware;
        this._database = database;
        this._passport = passport;

        this._init();
    }

    // Слушатели запросов контроллера AuthController
    private _init() {
        this._app.post(ApiRoutes.signUp, this._isAuthenticated.bind(this), this._signUp.bind(this));
        this._app.post(ApiRoutes.signIn, this._isAuthenticated.bind(this), this._signIn.bind(this));
        this._app.get(ApiRoutes.logout, this._middleware.mustAuthenticated.bind(this._middleware), this._logout.bind(this));
    }

    // Проверяем авторизирован ли пользователь в системе
    private async _isAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.isAuthenticated()) {
                // Получаем поле rememberMe из Redis
                const rememberMe = await this._redisWork.get(RedisKeys.REMEMBER_ME, (req.user as IUser).id);

                // Обновляем время жизни токена сессии (куки)
                req.session.cookie.expires = getExpiredToken(Boolean(rememberMe));
    
                return res.status(HTTPStatuses.PermanentRedirect).send({ success: false, message: ErrorTextsApi.YOU_ALREADY_AUTH });
            }
    
            next();
        } catch (error) {
            const nextError = error instanceof AuthError
                ? error
                : new AuthError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
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
                await transaction.rollback();
                return res.status(HTTPStatuses.BadRequest).send({ success: false, message: `Пользователь с почтовым адресом ${email} уже существует`, field: "email" });
            }

            const checkDublicatePhone = await this._database.models.users.findOne({ where: { phone }, transaction });

            if (checkDublicatePhone) {
                await transaction.rollback();
                return res.status(HTTPStatuses.BadRequest).send({ success: false, message: `Пользователь с номером телефона ${phone} уже существует`, field: "phone" });
            }

            // "Соль"
            const salt = crypto.randomBytes(128);
            const saltString = salt.toString("hex");

            crypto.pbkdf2(password, saltString, 4096, 256, "sha256", (error, hash) => {
                if (error) {
                    throw error;
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
                                        req.login(user, async function (error: string) {
                                            if (error) {
                                                throw new Error(error);
                                            }

                                            await transaction.commit();

                                            return res.json({ success: true, user });
                                        });
                                    } else {
                                        throw new Error("Пользователь не создался в базе данных в таблице UserDetails");
                                    }
                                })
                                .catch((error: Error) => {
                                    throw new Error(`Ошибка при создании записи в таблице UserDetails: ${error}`);
                                });
                        } else {
                            throw new Error("Пользователь не создался в базе данных в таблице Users");
                        }
                    })
                    .catch((error: Error) => {
                        throw new Error(`Создание новой записи в базе данных завершилось не удачно: ${error}`);
                    });
            });
        } catch (error) {
            const nextError = error instanceof AuthError
                ? error
                : new AuthError(error);

            await transaction.rollback();
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    };

    // Вход пользователя
    private async _signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const { rememberMe }: { rememberMe: boolean } = req.body;

            this._passport.authenticate("local", { session: true }, async (error: string, user: IUser, info: { message: string }) => {
                if (error) {
                    throw new Error(error);
                }

                if (!user) {
                    return res.status(HTTPStatuses.BadRequest).send({ success: false, message: info.message });
                }

                if (!req.sessionID) {
                    throw new Error("уникальный идентификатор сессии не существует");
                }

                return req.logIn(user, async (error: string) => {
                    if (error) {
                        throw new Error(error);
                    }

                    // Записываем в Redis значение поля rememberMe
                    await this._redisWork.set(RedisKeys.REMEMBER_ME, user.id, JSON.stringify(rememberMe));

                    // Обновляем срок жизни токена сессии (куки)
                    req.session.cookie.expires = getExpiredToken(rememberMe);

                    return res.json({ success: true });
                });
            })(req, res, next);
        } catch (error) {
            const nextError = error instanceof AuthError
                ? error
                : new AuthError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    };

    // Выход пользователя
    private async _logout(req: Request, res: Response) {
        try {
            const userId = (req.user as IUser).id;

            // Выход из passport.js
            req.logout((error) => {
                if (error) {
                    throw new Error(`удаление пользователя из запроса завершилось неудачно: ${error}`);
                }

                // Удаляем текущую сессию пользователя
                req.session.destroy(async (error: string) => {
                    if (error) {
                        throw new Error(`удаление сессии пользователя завершилось не удачно: ${error}`);
                    }

                    if (!req.sessionID) {
                        throw new Error(`отсутствует id сессии пользователя (session=${req.session})`);
                    }

                    // Удаляем сессию из Redis
                    await this._redisWork.delete(RedisKeys.SESSION, req.sessionID);
                    // Удаляем флаг rememberMe из Redis
                    await this._redisWork.delete(RedisKeys.REMEMBER_ME, userId);

                    // Удаляем session-cookie (sid)
                    return res.clearCookie(COOKIE_NAME).json({ success: true });
                });
            });
        } catch (error) {
            const nextError = error instanceof AuthError
                ? error
                : new AuthError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    };
};