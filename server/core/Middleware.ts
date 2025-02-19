import { Request, Response, NextFunction, Express } from "express";
import path from "path";

import Logger from "@service/logger";
import { t } from "@service/i18n";
import RedisWorks from "@core/Redis";
import { HTTPStatuses, RedisKeys } from "@custom-types/enums";
import { IRequestWithShapedImages, IRequestWithSharpedAvatar } from "@custom-types/express.types";
import { ISafeUser } from "@custom-types/user.types";
import { createSharpedImage } from "@utils/files";
import { updateSessionMaxAge } from "@utils/session";
import { AuthError } from "@errors/controllers";
import { BaseError, MiddlewareError } from "@errors/index";

const logger = Logger("Middleware");

// Класс, отвечает за выполнение мидлваров для HTTP-запросов
export default class Middleware {
    constructor(private readonly _redisWork: RedisWorks, private readonly _app: Express) {}

    // Пользователь должен быть авторизован в системе
    async mustAuthenticated(req: Request, _: Response, next: NextFunction) {
        try {
            const user = req.user as ISafeUser;

            logger.debug("mustAuthenticated [user=%j]", user);

            if (!req.isAuthenticated()) {
                return next(new MiddlewareError(t("auth.error.not_auth_or_token_expired"), HTTPStatuses.Unauthorized));
            }

            if (!user) {
                return next(new MiddlewareError(t("users.error.user_not_found"), HTTPStatuses.NotFound));
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
            return next(error);
        }
    }

    // Общая обработка ошибок, вызванных в контроллерах через next(error)
    catch() {
        logger.debug("catch");

        // Для корректного выполнения обработчика ошибки ендпоинтов необходимо всегда указывать 4 параметра (даже если все 4 не используются)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._app.use((error: Error, _: Request, res: Response, __: NextFunction) => {
            const nextError = error instanceof BaseError
                ? error
                : new BaseError(error.message);

            let errorMessage = {
                success: false, 
                message: nextError.message
            };

            // При необходимости дополняем возвращаемый объект ошибки (например, при входе)
            if ((nextError as AuthError).options) {
                errorMessage = {
                    ...errorMessage,
                    ...(nextError as AuthError).options
                }
            }

            logger.debug("catch error middleware [errorMessage=%j]", errorMessage);

            return res.status(nextError.status).send(errorMessage);
        });
    }

    // Сжимаем изображение аватара
    async sharpAvatar(req: Request, _: Response, next: NextFunction) {
        logger.debug("sharpAvatar [req.file=%j]", req.file);

        try {
            // Сжимаем переданный аватар пользователя и дублируем его на диск в раздел "Фотографии"
            const { folderPath, outputFile } = await createSharpedImage({ ...req.file!, fieldname: "photo" });
            (req as IRequestWithSharpedAvatar).sharpedPhotoUrl = path.join(folderPath, outputFile);

            // Сжимаем переданный аватар пользователя
            (req as IRequestWithSharpedAvatar).sharpedAvatarUrl = await this._getSharpedUrl(req);

            next();
        } catch (error) {
            next(error);
        }
    }

    // Сжимаем несколько фотографий
    async sharpImages(req: Request, _: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[];

            logger.debug("sharpImages [files=%j]", files);

            if (!files || !files.length) {
                return next(new MiddlewareError(t("photos.error.photo_not_found"), HTTPStatuses.BadRequest));
            }

            Promise
                .all(files.map(async file => {
                    req.file = file;
                    return await this._getSharpedUrl(req);
                }))
                .then(result => {
                    // Сохраняем массив обрезанных изображений
                    (req as IRequestWithShapedImages).sharpedImageUrls = result;
                    // Удаляем оригинальные объекты файлов из запроса
                    delete req.files;
                    next();
                })
                .catch((error: Error) => {
                    return next(new MiddlewareError(t("photos.error.sharped_photo_with_error", { errorMessage: error.message })));
                });
        } catch (error) {
            next(error);
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
            // Объект ошибки попросту прокидывается выше, так как все равно там будет обработка через MiddlewareError
            throw error;
        }
    }
}