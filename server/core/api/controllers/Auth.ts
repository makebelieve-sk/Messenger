import crypto from "crypto";
import type { Express, NextFunction, Request, Response } from "express";
import type { PassportStatic } from "passport";

import Middleware from "@core/api/Middleware";
import UsersController from "@core/controllers/UsersController";
import Database from "@core/database/Database";
import RedisWorks from "@core/Redis";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { AuthError } from "@errors/controllers";
import { PassportError } from "@errors/index";
import { ApiRoutes, HTTPErrorTypes, HTTPStatuses, RedisKeys, SocketActions } from "@custom-types/enums";
import { type ISafeUser } from "@custom-types/user.types";
import { COOKIE_NAME } from "@utils/constants";
import { updateSessionMaxAge } from "@utils/session";

const logger = Logger("AuthController");
const NOT_REQUIRED_SIGN_UP_FIELDS = [ "avatarUrl", "photoUrl" ];

// Класс, отвечающий за API авторизации/аутентификации
export default class AuthController {
	static redisWork: RedisWorks;
	static users: UsersController;

	constructor(
		private readonly _app: Express,
		private readonly _middleware: Middleware,
		private readonly _database: Database,
		private readonly _redisWork: RedisWorks,
		private readonly _passport: PassportStatic,
		private readonly _users: UsersController,
	) {
		AuthController.redisWork = this._redisWork;
		AuthController.users = this._users;

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
		logger.debug("_isAuthenticated");

		try {
			if (req.isAuthenticated()) {
				// Получаем поле rememberMe из Redis
				const rememberMe = await this._redisWork.get(RedisKeys.REMEMBER_ME, req.user.id);

				// Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
				await updateSessionMaxAge(req.session, Boolean(rememberMe));

				return next(new AuthError(t("auth.error.you_already_auth"), HTTPStatuses.PermanentRedirect));
			}

			next();
		} catch (error) {
			next(error);
		}
	}

	// Регистрация пользователя
	private async _signUp(req: Request, res: Response, next: NextFunction) {
		logger.debug("_signUp, [body=%j]", req.body);

		const transaction = await this._database.sequelize.transaction();

		try {
			const fields = req.body;

			// Формируем те поля из объекта req.body, которые остались пусты
			const missingFields = Object.entries(fields)
				.filter(([ key, value ]) => !value && !NOT_REQUIRED_SIGN_UP_FIELDS.includes(key))
				.map(([ key ]) => key);

			// Проверка обязательных полей объекта регистрации
			if (missingFields.length) {
				throw new AuthError(
					t("auth.error.missing_fields", { fields: missingFields.join(", ") }),
					HTTPStatuses.BadRequest,
					{
						type: HTTPErrorTypes.SIGN_UP,
						fields: missingFields,
					},
				);
			}

			const { firstName, thirdName, email, phone, password, avatarUrl, photoUrl } = fields;

			// Проверка на существование почты и телефона
			const checkDublicateEmail = await this._database.repo.users.findOneBy({
				filters: { email },
				transaction,
			});

			if (checkDublicateEmail) {
				throw new AuthError(
					t("auth.error.user_with_email_already_exists", { email }),
					HTTPStatuses.Conflict,
					{
						type: HTTPErrorTypes.SIGN_UP,
						field: "email",
					},
				);
			}

			const checkDublicatePhone = await this._database.repo.users.findOneBy({
				filters: { phone },
				transaction,
			});

			if (checkDublicatePhone) {
				throw new AuthError(
					t("auth.error.user_with_phone_already_exists", { phone }),
					HTTPStatuses.Conflict,
					{
						type: HTTPErrorTypes.SIGN_UP,
						field: "phone",
					},
				);
			}

			// "Соль"
			const salt = crypto.randomBytes(128);
			const saltString = salt.toString("hex");

			/**
			 * Генерируем хеш пароля, приправленным "солью"
			 * Важный момент! Даже зная про синхронный метод crypto.pbkdf2Sync все равно лучше оставить так,
			 * потому что асинхронный метод никогда не заблокирует поток выполнения.
			 */
			const hashString = await new Promise<string>((resolve, reject) => {
				crypto.pbkdf2(password, saltString, 4096, 256, "sha256", (error, hash) => {
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
				throw new AuthError(t("auth.error.creating_user"));
			}

			const { user, userDetails, notificationSettings } = createdUserData;

			/**
			 * Используем обертку над асинхронным методом для того, чтобы подождать результат выполнения и
			 * корректно обработать ошибку (работает также, как promisify из пакета node.util)
			 */
			await new Promise((resolve, reject) => {
				req.login(user, async (error?: PassportError) => {
					error ? reject(error) : resolve(true);
				});
			});

			await transaction.commit();

			res.status(HTTPStatuses.Created).json({ success: true, user, userDetails, notificationSettings });
		} catch (error) {
			await transaction.rollback();
			next(error);
		}
	}

	// Вход пользователя
	private async _signIn(req: Request, res: Response, next: NextFunction) {
		logger.debug("_signIn, [body=%j]", req.body);

		const transaction = await this._database.sequelize.transaction();

		try {
			const { rememberMe }: { rememberMe: boolean } = req.body;

			const user = await new Promise<ISafeUser>((resolve, reject) => {
				this._passport.authenticate("local", { session: true }, (error: PassportError | null, user: ISafeUser) => {
					// Если ошибка, то она только PassportError, значит просто прокидываем ее во внешний catch как есть
					if (error) return reject(error);
					if (!req.sessionID) return reject(new AuthError(t("auth.error.session_id_not_exists")));

					resolve(user);
				})(req, res, next);
			});

			// Получаем пользователя из Passport.js (он уже типа ISafeUser)
			await new Promise((resolve, reject) => {
				req.logIn(user, (error?: PassportError) => {
					error ? reject(error) : resolve(user);
				});
			});

			// Записываем в Redis значение поля rememberMe
			await this._redisWork.set(RedisKeys.REMEMBER_ME, user.id, JSON.stringify(rememberMe));

			// Обновляем время жизни записи только в том случае, если пользователь не нажал на "Запомнить меня"
			if (!rememberMe) {
				await this._redisWork.expire(RedisKeys.REMEMBER_ME, user.id);
			}

			// Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
			await updateSessionMaxAge(req.session, Boolean(rememberMe));

			// Получение дополнительной информации и общих звуковых настроек пользователя
			const { userDetails, notificationSettings } = await this._database.repo.populateUser({ userId: user.id, transaction });

			await transaction.commit();

			res.json({
				success: true,
				user,
				userDetails: userDetails.getEntity(),
				notificationSettings: notificationSettings.getEntity(),
			});
		} catch (error) {
			await transaction.rollback();
			next(error);
		}
	}

	// Выход пользователя
	private async _logout(req: Request, res: Response, next: NextFunction) {
		try {
			logger.debug("_logout [userId=%s]", req.user.id);

			// Выход из текущей сессии
			const socketNotification = await AuthController.logout(req);

			// Уведомляем собственные подключения о выходе
			await socketNotification();

			// Удаляем session-cookie (sid)
			res.status(HTTPStatuses.NoContent).clearCookie(COOKIE_NAME).end();
		} catch (error) {
			next(error);
		}
	}

	// Статичный метод выхода. Он статичен, так как будет использоваться в другом классе контроллере (см. MainController)
	static async logout(req: Request) {
		const { id: userId } = req.user;

		if (!req.sessionID) {
			throw new AuthError(t("auth.error.session_id_not_exists_on_deleted_session", {
				session: req.session.toString(),
			}));
		}

		// Выход из passport.js
		await new Promise((resolve, reject) => {
			req.logout((error?: Error) => {
				error ? reject(new AuthError(error.message)) : resolve(true);
			});
		});

		// Удаляем текущую сессию express.js пользователя
		await new Promise((resolve, reject) => {
			req.session.destroy((error?: Error) => {
				error ? reject(new AuthError(error.message)) : resolve(true);
			});
		});

		// Удаляем флаг rememberMe из Redis
		await AuthController.redisWork.delete(RedisKeys.REMEMBER_ME, userId);

		return async () => {
			// Получаем из списка пользователей текущего пользователя
			const logoutingUser = AuthController.users.get(userId);

			if (!logoutingUser) {
				throw new AuthError(t("auth.error.user_not_exists"), HTTPStatuses.NotFound);
			}

			// Получаем сокет-контроллер текущего пользователя
			const socketController = Array.from(logoutingUser.sockets.values())[0];

			// Отправляем событие пользователю о выходе (всем его открытым вкладкам)
			await socketController.sendTo(SocketActions.LOG_OUT, {}, userId);
		};
	}
}
