import { Express } from "express";
import crypto from "crypto";
import Passport, { PassportStatic } from "passport";
import { IVerifyOptions, Strategy } from "passport-local";

import Database from "./Database";
import { ISaveUser, UserInstance } from "../database/models/Users";
import { getSaveUserFields } from "../utils/user";
import { PassportError } from "../errors";
import { IUser } from "../types/models.types";
import { UsersType } from "../types";

interface IConstructor {
    app: Express;
    database: Database;
    users: UsersType;
};

type DoneType = (error: string | null, user?: ISaveUser | false, options?: IVerifyOptions | undefined) => void;

const errorSign = "Не верно указан логин или пароль";

export default class PassportWorks {
    private readonly _app: Express;
    private readonly _passport: PassportStatic;
    private readonly _database: Database;
    private readonly _users: UsersType;

    constructor({ app, database, users }: IConstructor) {
        this._app = app;
        this._database = database;
        this._users = users;
        this._passport = Passport;

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

        // Достаем данные о пользователе из его сессии
        this._passport.serializeUser<string>((user, done) => {
            console.log("serializeUser: ", user);

            process.nextTick(() => {
                if (!this._users.has((user as IUser).id)) {
                    this._users.set((user as IUser).id, user as IUser);
                }
                
                done(null, (user as IUser).id);
            });
        });

        // Сохраняем данные о пользователе в его сессию
        this._passport.deserializeUser((userId: string, done) => {
            console.log("deserializeUser: ", userId);

            process.nextTick(() => {
                const user = this._users.get(userId);

                if (user) {
                    return done(null, user);
                } else {
                    this._database.models.users
                        .findByPk(userId)
                        .then(currectUser => {
                            if (currectUser) {
                                const user = getSaveUserFields(currectUser);

                                this._users.set(user.id, user as IUser);

                                return done(null, user);
                            } else {
                                return new PassportError(`Пользователь с id=${userId} не найден`);
                            }
                        })
                        .catch(error => {
                            const nextError = error instanceof PassportError
                                ? error
                                : new PassportError(error);
                            done(nextError.message);
                        });
                }
            });
        });
    }

    // Проверка подлинности пользователя
    private async _verify(login: string, password: string, done: DoneType): Promise<void> {
        try {
            const candidateEmail = await this._database.models.users.findOne({ where: { email: login } });
    
            if (candidateEmail) {
                return this._comparePasswords(candidateEmail, password, done);
            } else {
                let phone = login.replace(/[^0-9]/g, "");
    
                phone = phone[0] === "8" ? "+7" + phone.slice(1) : "+" + phone;
    
                const candidatePhone = await this._database.models.users.findOne({ where: { phone } });
    
                if (candidatePhone) {
                    return this._comparePasswords(candidatePhone, password, done);
                } else {
                    return done(null, false, { message: errorSign });
                }
            }
        } catch (error) {
            const nextError = error instanceof PassportError
                ? error
                : new PassportError(error);
            done(null, false, { message: nextError.message });
        }
    }

    // Сравнение паролей пользователя (текущего и сохраненного в БД)
    private _comparePasswords(candidate: UserInstance, password: string, done: DoneType) {
        crypto.pbkdf2(password, candidate.salt, 4096, 256, "sha256", function (error, hash) {
            if (error) {
                throw error;
            }
    
            // Генерируем хеш пароля, приправленным "солью"
            const hashString = hash.toString("hex");
            const user = getSaveUserFields(candidate);
    
            hashString === candidate.password
                ? done(null, user)
                : done(null, false, { message: errorSign });
        });
    }
}