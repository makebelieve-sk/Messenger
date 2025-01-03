import { Express } from "express";
import crypto from "crypto";
import Passport, { PassportStatic } from "passport";
import { IVerifyOptions, Strategy } from "passport-local";

import Database from "./Database";
import { UserInstance } from "../database/models/Users";
import { getSafeUserFields } from "../utils/user";
import { validPhoneNumber } from "../utils";
import { PassportError } from "../errors";
import { UsersType } from "../types";
import { ErrorTextsApi, HTTPStatuses } from "../types/enums";
import { ISocketUser } from "../types/socket.types";
import { ISafeUser } from "../types/user.types";

type DoneType = (error: PassportError | null, user?: ISafeUser | false, options?: IVerifyOptions) => void;

// Класс, отвечает за стратегию аутентификации пользователя
export default class PassportWorks {
    private readonly _passport: PassportStatic = Passport;

    constructor(private readonly _app: Express, private readonly _database: Database, private readonly _users: UsersType) {
        this._init();
    }

    get passport() {
        return this._passport;
    }

    private _init() {
        // Мидлвары авторизации через passport.js
        this._app.use(this._passport.initialize());
        this._app.use(this._passport.session());

        this._passport.use(new Strategy({ usernameField: "login", passwordField: "password" }, this._verify.bind(this)));

        // Достаем данные о пользователе из его сессии при входе
        this._passport.serializeUser<string>((user, done: (error: PassportError | null, userId: string) => void) => {
            // Так как метод serializeUser имеет четкую типизацию в самой библиотеке, то тут два варианта:
            // 1) Изменить тип в библиотеке вручную (минус в том, что при каждом обновлении версии пакета необходимо проверять этот тип)
            // 2) Создать новую переменную для указания типа
            // В любом варианте не придется писать (user as ISafeUser), что упростит код
            const me = user as ISafeUser;
            console.log("serializeUser: ", me);

            process.nextTick(() => {
                if (!this._users.has(me.id)) {
                    this._users.set(me.id, me as ISocketUser);
                }
                
                done(null, me.id);
            });
        });

        // Сохраняем данные о пользователе в его сессию при каждом запросе
        this._passport.deserializeUser((userId: string, done: DoneType) => {
            console.log("deserializeUser: ", userId);

            process.nextTick(() => {
                const user = this._users.get(userId);

                if (user) {
                    done(null, user);
                } else {
                    this._database.models.users
                        .findByPk(userId)
                        .then(currectUser => {
                            if (currectUser) {
                                const user = getSafeUserFields(currectUser);

                                // Напоминание
                                // На сервере одна общая мапа пользователей (это список онлайн, то есть те юзеры, которые прошли авторизацию -> значит подключаются к сокету).
                                // В запросах (express) мы не должны использовать идентификатор сокет соединения (он там попросту не нужен).
                                // В обработчиках событий сокет соединения нам необходимо использовать идентификатор сокет соединения.
                                // Поэтому здесь (сериализация устанавливает объект пользователя в объект запроса req.user) мы устанавливаем поле
                                // socketID = null, потому что вскоре после этого действия произойдет установка сокет соединения на клиенте с сервером
                                // и в этот момент произойдет установка socketID на нужный.
                                this._users.set(user.id, { ...user, socketID: null as never });

                                done(null, user);
                            } else {
                                done(new PassportError(`Пользователь с id=${userId} не найден`));
                            }
                        })
                        .catch((error: Error) => {
                            const nextError = error instanceof PassportError
                                ? error
                                : new PassportError(error.message);

                            done(nextError);
                        });
                }
            });
        });
    }

    // Проверка подлинности пользователя
    private async _verify(login: string, password: string, done: DoneType) {
        try {
            const candidateEmail = await this._database.models.users.findOne({ where: { email: login } });
    
            if (candidateEmail) {
                return this._comparePasswords(candidateEmail, password, done);
            }

            const phone = validPhoneNumber(login);

            if (phone) {
                const candidatePhone = await this._database.models.users.findOne({ where: { phone } });

                if (candidatePhone) {
                    return this._comparePasswords(candidatePhone, password, done);
                }
            }

            done(new PassportError(ErrorTextsApi.INCORRECT_LOGIN_OR_PASSWORD, HTTPStatuses.BadRequest));
        } catch (error) {
            const nextError = error instanceof PassportError
                ? error
                : new PassportError((error as Error).message);

            done(nextError);
        }
    }

    // Сравнение паролей пользователя (текущего и сохраненного в БД)
    private _comparePasswords(candidate: UserInstance, password: string, done: DoneType) {
        try {
            // Генерируем хеш пароля, приправленным "солью"
            const hash = crypto.pbkdf2Sync(password, candidate.salt, 4096, 256, "sha256");

            const hashString = hash.toString("hex");
            const user = getSafeUserFields(candidate);
    
            return hashString === candidate.password
                ? done(null, user)
                : done(new PassportError(ErrorTextsApi.INCORRECT_LOGIN_OR_PASSWORD, HTTPStatuses.BadRequest));
        } catch (error) {
            return done(new PassportError((error as Error).message));
        }
    }
}