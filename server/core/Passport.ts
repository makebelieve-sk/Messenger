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
import { HTTPStatuses } from "../types/enums";
import { t } from "../service/i18n";

type DoneType = (error: PassportError | null, user?: ISaveUser | false, options?: IVerifyOptions) => void;

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

        // Достаем данные о пользователе из его сессии
        this._passport.serializeUser<string>((user, done: (error: PassportError | null, userId: string) => void) => {
            console.log("serializeUser: ", user);

            process.nextTick(() => {
                if (!this._users.has((user as IUser).id)) {
                    this._users.set((user as IUser).id, user as IUser);
                }
                
                done(null, (user as IUser).id);
            });
        });

        // Сохраняем данные о пользователе в его сессию
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
                                const user = getSaveUserFields(currectUser);

                                this._users.set(user.id, user as IUser);

                                done(null, user);
                            } else {
                                throw new PassportError(t("user_with_id_not_found", { id: userId }));
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
                this._comparePasswords(candidateEmail, password, done);
            } else {
                let phone = login.replace(/[^0-9]/g, "");
                phone = phone[0] === "8" ? "+7" + phone.slice(1) : "+" + phone;
    
                const candidatePhone = await this._database.models.users.findOne({ where: { phone } });

                if (candidatePhone) {
                    this._comparePasswords(candidatePhone, password, done);
                } else {
                    
                    done(new PassportError(t("incorrect_login_or_password"), HTTPStatuses.BadRequest));
                }
            }
        } catch (error) {
            const nextError = error instanceof PassportError
                ? error
                : new PassportError((error as Error).message);

            done(nextError);
        }
    }

    // Сравнение паролей пользователя (текущего и сохраненного в БД)
    private _comparePasswords(candidate: UserInstance, password: string, done: DoneType) {
        crypto.pbkdf2(password, candidate.salt, 4096, 256, "sha256", function (error, hash) {
            if (error) {
                throw new PassportError(error.message);
            }
    
            // Генерируем хеш пароля, приправленным "солью"
            const hashString = hash.toString("hex");
            const user = getSaveUserFields(candidate);
    
            hashString === candidate.password
                ? done(null, user)
                : done(new PassportError(t("incorrect_login_or_password"), HTTPStatuses.BadRequest));
        });
    }
}