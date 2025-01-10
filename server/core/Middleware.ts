import { Request, Response, NextFunction } from "express";
import path from "path";
import EventEmitter from "events";

import RedisWorks from "./Redis";
import { HTTPStatuses, RedisKeys } from "../types/enums";
import { IUser } from "../types/models.types";
import { IRequestWithImagesSharpData, IRequestWithSharpData } from "../types/express.types";
import { ApiServerEvents } from "../types/events";
import { MiddlewareError } from "../errors";
import { createSharpedFile } from "../utils/files";
import { updateSessionMaxAge } from "../utils/session";
import { t } from "../service/i18n";

// Класс, отвечает за выполнение мидлваров для HTTP-запросов
export default class Middleware extends EventEmitter {
    constructor(private readonly _redisWork: RedisWorks) {
        super();
    }

    // Пользователь должен быть авторизован в системе
    async mustAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.isAuthenticated()) {
                throw new MiddlewareError(t("not_auth_or_token_expired"), HTTPStatuses.Unauthorized);
            }

            if (!req.user) {
                throw new MiddlewareError(t("user_not_found"), HTTPStatuses.NotFound);
            }

            // Получаем поле rememberMe из Redis
            const rememberMe = await this._redisWork.get(RedisKeys.REMEMBER_ME, (req.user as IUser).id);
        
            // Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
            await updateSessionMaxAge(req.session, Boolean(rememberMe));
        
            next();
        } catch (error) {
            this._handleError(error, res);
        }
    }

    // Обрезка одного изображения
    async sharpImage(req: Request, res: Response, next: NextFunction) {
        try {
            // Дублируем добавленный/измененный аватар в раздел "Фотографии" и сжимаем его
            const { folderPath, outputFile } = await createSharpedFile({ ...req.file!, fieldname: "photo" });
            (req as IRequestWithSharpData).dublicateSharpImageUrl = path.join(folderPath, outputFile);

            (req as IRequestWithSharpData).sharpImageUrl = await this._getSharpedUrl(req);
        
            next();
        } catch (error) {
            this._handleError(error, res);
        }
    }

    // Обрезка нескольких изображений
    async sharpImages(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files || !files.length) {
                throw new MiddlewareError(t("photos_not_found"));
            }

            Promise
                .all(files.map(async file => {
                    req.file = file;
                    return await this._getSharpedUrl(req);
                }))
                .then(result => {
                    // Сохраняем массив обрезанных изображений
                    (req as IRequestWithImagesSharpData).sharpImagesUrls = result;
                    // Удаляем оригинальные объекты файлов из запроса
                    delete req.files;
                    next();
                })
                .catch((error: Error) => {
                    throw new MiddlewareError(`${t("sharped_photo_with_error")}: ${error.message}`);
                });
        } catch (error) {
            this._handleError(error, res);
        }
    }

    // Получение пути к сжатому изображению
    private async _getSharpedUrl(req: Request) {
        try {
            const file = req.file;

            if (!file) {
                throw new MiddlewareError(t("photo_not_given"), HTTPStatuses.NotFound);
            }

            const { folderPath, outputFile } = await createSharpedFile(file);

            // Удаляем оригинальный объект файла из запроса
            delete req.file;

            return path.join(folderPath, outputFile);
        } catch (error) {
            // Объект ошибки попросту прокидывается выше, так как все равно там будет обработка через MiddlewareError
            throw error;
        }
    }

    // Обработка ошибки
    private _handleError(error: unknown, res: Response) {
        this.emit(ApiServerEvents.ERROR, { error, res });
    }
}