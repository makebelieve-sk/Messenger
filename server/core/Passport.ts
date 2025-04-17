import crypto from "crypto";
import { Express } from "express";
import Passport, { PassportStatic } from "passport";
import { IVerifyOptions, Strategy } from "passport-local";

import UsersController from "@core/controllers/UsersController";
import Database from "@core/database/Database";
import { User } from "@core/database/models/user";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { PassportError } from "@errors/index";
import { HTTPErrorTypes, HTTPStatuses } from "@custom-types/enums";
import { ISafeUser } from "@custom-types/user.types";
import { validateEmail, validatePhoneNumber } from "@utils/auth";
import { IS_DEV } from "@utils/constants";

const logger = Logger("Passport");

type DoneType = (error: PassportError | null, user?: ISafeUser, options?: IVerifyOptions) => void;

// Класс, отвечает за стратегию аутентификации пользователя
export default class PassportWorks {
	private readonly _passport: PassportStatic = Passport;

	constructor(
		private readonly _app: Express,
		private readonly _database: Database,
		private readonly _users: UsersController,
	) {
		this._init();
	}

	get passport() {
		return this._passport;
	}

	private _init() {
		logger.debug("init");

		// Мидлвары авторизации через passport.js
		this._app.use(this._passport.initialize());
		this._app.use(this._passport.session());

		// Локальная стратегия входа пользователя (по логину/паролю)
		this._passport.use(new Strategy({ usernameField: "login", passwordField: "password" }, this._verify.bind(this)));

		// Достаем данные о пользователе из его сессии при входе
		this._passport.serializeUser<string>((user, done: (error: PassportError | null, userId: string) => void) => {
			logger.info("serializeUser [me=%j]", user);

			process.nextTick(() => {
				if (!this._users.has(user.id)) {
					this._users.add(user);
				}

				done(null, user.id);
			});
		});

		// Сохраняем данные о пользователе в его сессию при каждом запросе
		this._passport.deserializeUser((userId: string, done: DoneType) => {
			logger.debug("deserializeUser [userId=%s]", userId);

			process.nextTick(() => {
				const user = this._users.get(userId);

				if (user) {
					done(null, user);
				} else {
					this._database.repo.users
						.getById({ userId })
						.then(async foundUser => {
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
							} else {
								done(new PassportError(t("users.error.user_with_id_not_found", { id: userId }), HTTPStatuses.NotFound));
							}
						})
						.catch((error: Error) => {
							const nextError = error instanceof PassportError ? error : new PassportError(error.message);

							done(nextError);
						});
				}
			});
		});
	}

	// Проверка подлинности пользователя
	private async _verify(login: string, password: string, done: DoneType) {
		if (IS_DEV) {
			logger.debug("_verify [login=%s, password=%s]", login, password);
		}

		try {
			if (!login || !password) {
				throw new PassportError(t("auth.error.incorrect_login_or_password"), HTTPStatuses.Unauthorized, { type: HTTPErrorTypes.SIGN_IN });
			}

			const email = validateEmail(login);

			if (email) {
				const candidateEmail = await this._database.repo.users.findOneBy({
					filters: { email },
				});

				if (candidateEmail) {
					return await this._comparePasswords(candidateEmail, password, done);
				}
			}

			const phone = validatePhoneNumber(login);

			if (phone) {
				const candidatePhone = await this._database.repo.users.findOneBy({
					filters: { phone },
				});

				if (candidatePhone) {
					return await this._comparePasswords(candidatePhone, password, done);
				} else {
					throw new PassportError(t("auth.error.incorrect_login_or_password"), HTTPStatuses.Unauthorized, { type: HTTPErrorTypes.SIGN_IN });
				}
			}

			throw new PassportError(t("auth.error.incorrect_login_or_password"), HTTPStatuses.Unauthorized, { type: HTTPErrorTypes.SIGN_IN });
		} catch (error) {
			const nextError = error instanceof PassportError ? error : new PassportError((error as Error).message);

			done(nextError);
		}
	}

	// Сравнение паролей пользователя (текущего и сохраненного в БД)
	private async _comparePasswords(candidate: User, password: string, done: DoneType) {
		if (IS_DEV) {
			logger.debug("_comparePasswords [candidate=%s, password=%s]", candidate, password);
		}

		try {
			// Генерируем хеш пароля, приправленным "солью"
			const hashString = await new Promise<string>((resolve, reject) => {
				crypto.pbkdf2(password, candidate.salt, 4096, 256, "sha256", (error, hash) => {
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

			throw new PassportError(t("auth.error.incorrect_login_or_password"), HTTPStatuses.Unauthorized, { type: HTTPErrorTypes.SIGN_IN });
		} catch (error) {
			throw new PassportError((error as Error).message);
		}
	}
}
