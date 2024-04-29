import { Express } from "express";
import crypto from "crypto";
import Passport, { PassportStatic } from "passport";
import { IVerifyOptions, Strategy } from "passport-local";

import Database from "./Database";
import { ISaveUser, UserInstance } from "../database/models/Users";
import { getSaveUserFields } from "../utils/user";

interface IConstructor {
    app: Express;
    database: Database;
};

type DoneType = (error: any, user?: ISaveUser | false, options?: IVerifyOptions | undefined) => void;

const errorSign = "Не верно указан логин или пароль";

export default class PassportWorks {
    private _app: Express;
    private _passport: PassportStatic;
    private _database: Database;

    constructor({ app, database }: IConstructor) {
        this._app = app;
        this._database = database;
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
        this._passport.serializeUser(function (user: any, done) {
            console.log("serializeUser: ", user);

            process.nextTick(() => {
                done(null, user.id);
            });
        });

        // Сохраняем данные о пользователе в его сессию
        this._passport.deserializeUser((userId: string, done) => {
            console.log("deserializeUser: ", userId);

            process.nextTick(() => {
                this._database.models.users
                    .findByPk(userId)
                    .then(currectUser => {
                        if (currectUser) {
                            const user = getSaveUserFields(currectUser);
                            return done(null, user);
                        } else {
                            return new Error(`Пользователь с id=${userId} не найден`);
                        }
                    })
                    .catch((error: any) => {
                        console.log(error);
                        done(error.message ?? error);
                    });
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
        } catch (error: any) {
            console.log(error);
            done(null, false, { message: error.message ?? error });
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