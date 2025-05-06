import { HTTPStatuses } from "common-types";
import type { Express, NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import path from "path";

import { ipLimiter, sessionIdLimiter } from "@config/rate-limiter.config";
import RedisWorks from "@core/Redis";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { BaseError, MiddlewareError } from "@errors/index";
import { RedisKeys } from "@custom-types/enums";
import { MB_1, MULTER_MAX_FILE_SIZE, MULTER_MAX_FILES_COUNT } from "@utils/constants";
import { createSharpedImage } from "@utils/files";
import { updateSessionMaxAge } from "@utils/session";

const logger = Logger("Middleware");

const LIMIT_FILE_SIZE = "LIMIT_FILE_SIZE";
const LIMIT_FILE_COUNT = "LIMIT_FILE_COUNT";

// Класс, отвечает за выполнение мидлваров для HTTP-запросов
export default class Middleware {
	constructor(
		private readonly _redisWork: RedisWorks,
		private readonly _app: Express,
	) {}

	// Общий мидлвар. Ограничение на число запросов на ендпоинт по id сессии или его ip-адресу
	rateLimiter() {
		logger.debug("rateLimiter");

		this._app.use((req, res, next) => {
			req.isAuthenticated()
				? sessionIdLimiter(req, res, next)
				: ipLimiter(req, res, next);
		});
	}

	// Частный мидлвар. Пользователь должен быть авторизован в системе
	async mustAuthenticated(req: Request, _: Response, next: NextFunction) {
		try {
			const user = req.user;

			logger.debug("mustAuthenticated [user=%j]", user);

			if (!req.isAuthenticated()) {
				throw new MiddlewareError(t("auth.error.not_auth_or_token_expired"), HTTPStatuses.Unauthorized);
			}

			if (!user) {
				throw new MiddlewareError(t("users.error.user_not_found"), HTTPStatuses.NotFound);
			}

			// Получаем поле rememberMe из Redis
			const rememberMe = await this._redisWork.get(RedisKeys.REMEMBER_ME, user.id);

			// Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
			await updateSessionMaxAge(req.session, Boolean(rememberMe));

			// Обновляем время жизни записи только в том случае, если пользователь не нажал на "Запомнить меня"
			if (!rememberMe) {
				await this._redisWork.expire(RedisKeys.REMEMBER_ME, user.id);
			}

			next();
		} catch (error) {
			next(error);
		}
	}

	// Общий мидлвар. Общая обработка ошибок, вызванных в контроллерах через next(error)
	catch() {
		logger.debug("catch");

		// Для корректного выполнения обработчика ошибки ендпоинтов необходимо всегда указывать 4 параметра (даже если все 4 не используются)
		this._app.use((error: Error | MulterError, _: Request, res: Response, __: NextFunction) => {
			const nextError = error instanceof BaseError 
				? error 
				: this._createNewError(error.message, error instanceof MulterError ? error.code : undefined);

			const errorMessage = {
				success: false,
				message: nextError.message,
				options: nextError.getOptions(),
			};

			/**
			 * Поле message в объекте логгера Winston зарезервировано, поэтому невозможно вывести текстовое сообщение,
			 * приходится изменять выводимый объект.
			 */
			logger.error("catch error middleware [errorMessage=%j]", {
				status: errorMessage.success,
				errorText: errorMessage.message,
				options: errorMessage.options,
			});

			res.status(nextError.status).send(errorMessage);
		});
	}

	// Частный мидлвар. Сжимаем изображение аватара
	async sharpAvatar(req: Request, _: Response, next: NextFunction) {
		logger.debug("sharpAvatar [req.file=%j]", req.file);

		try {
			// Сжимаем переданный аватар пользователя и дублируем его на диск в раздел "Фотографии"
			const { folderPath, outputFile } = await createSharpedImage({
				...req.file!,
				fieldname: "photo",
			});
			req.sharpedPhotoUrl = path.join(folderPath, outputFile);

			// Сжимаем переданный аватар пользователя
			req.sharpedAvatarUrl = await this._getSharpedUrl(req);

			next();
		} catch (error) {
			next(error);
		}
	}

	// Частный мидлвар. Сжимаем несколько фотографий
	async sharpImages(req: Request, _: Response, next: NextFunction) {
		try {
			const files = req.files as Express.Multer.File[];

			logger.debug("sharpImages [files=%j]", files);

			if (!files || !files.length) {
				throw new MiddlewareError(t("photos.error.photo_not_found"), HTTPStatuses.BadRequest);
			}

			Promise.all(
				files.map(async file => {
					req.file = file;
					return await this._getSharpedUrl(req);
				}),
			)
				.then(result => {
					// Сохраняем массив обрезанных изображений
					req.sharpedImageUrls = result;
					// Удаляем оригинальные объекты файлов из запроса
					delete req.files;
					next();
				})
				.catch((error: Error) => {
					// Пишем return next потому, что try catch обрабатывает ошибки только в синхронном коде, а значит при throw он их не перехватит
					return next(
						new MiddlewareError(t("photos.error.sharped_photo_with_error", {
							errorMessage: error.message,
						})),
					);
				});
		} catch (error) {
			next(error);
		}
	}

	// Обработка типа ошибки и её создание, если это обычная ошибка сервера, иначе возврат ошибки Multer с соответствующим сообщением
	private _createNewError(message: string, code?: string) {
		switch (code) {
		// Это проверки ошибки Multer - их всего два типа: на максимальный размер и количество файлов
		case LIMIT_FILE_SIZE:
			return new BaseError(
				t("middleware.error.limit_file_size", {
					maxSize: (MB_1 * MULTER_MAX_FILE_SIZE).toString(),
				}),
				HTTPStatuses.PayloadTooLarge,
			);
		case LIMIT_FILE_COUNT:
			return new BaseError(
				t("middleware.error.limit_file_count", {
					maxCount: MULTER_MAX_FILES_COUNT.toString(),
				}),
				HTTPStatuses.PayloadTooLarge,
			);
			// Иначе это обычная ошибка, которая возникла на сервере (не кастомная) и её нужно вернуть со статусом 500 (по умолчанию)
		default:
			return new BaseError(message);
		}
	}

	// Получение пути к сжатому изображению
	private async _getSharpedUrl(req: Request) {
		try {
			const file = req.file;

			logger.debug("_getSharpedUrl [file=%j]", file);

			if (!file) {
				throw new MiddlewareError(t("photos.error.photo_not_given"), HTTPStatuses.BadRequest);
			}

			const { folderPath, outputFile } = await createSharpedImage(file);

			// Удаляем оригинальный объект файла из запроса
			delete req.file;

			return path.join(folderPath, outputFile);
		} catch (error) {
			throw error;
		}
	}
}
