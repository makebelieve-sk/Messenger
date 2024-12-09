import { Request, Response, NextFunction } from "express";
import path from "path";

import RedisWorks from "./Redis";
import { ErrorTextsApi, HTTPStatuses, RedisKeys } from "../types/enums";
import { IUser } from "../types/models.types";
import { IRequestWithImagesSharpData, IRequestWithSharpData } from "../types/express.types";
import { updateSessionMaxAge } from "../utils/session";
import { MiddlewareError } from "../errors";
import { createSharpedFile } from "../utils/files";

// Класс, отвечает за выполнение мидлваров для HTTP-запросов
export default class Middleware {
    constructor(private readonly _redisWork: RedisWorks) {}

    // Пользователь должен быть авторизован в системе
    async mustAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(HTTPStatuses.Unauthorized).send({ success: false, message: ErrorTextsApi.NOT_AUTH_OR_TOKEN_EXPIRED });
            }

            const userId = (req.user as IUser).id;

            // Получаем поле rememberMe из Redis
            const rememberMe = await this._redisWork.get(RedisKeys.REMEMBER_ME, userId);
        
            // Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
            await updateSessionMaxAge(req.session, Boolean(rememberMe));
        
            next();
        } catch (error) {
            const nextError = error instanceof MiddlewareError
                ? error
                : new MiddlewareError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    }

    // Обрезка одного изображения
    async sharpImage(req: Request, res: Response, next: NextFunction) {
        try {
            // Дублируем добавленный/измененный аватар в раздел "Фотографии" и сжимаем его
            const { folderPath, outputFile } = await createSharpedFile({ ...req.file!, fieldname: "photo" });
            (req as IRequestWithSharpData).dublicateSharpImageUrl = path.join(folderPath, outputFile);

            // TODO as написано для того, чтобы не было конфликта типа this._getSharpedUrl (исправиться при рефакторинге ошибок https://tracker.yandex.ru/MESSANGER-7)
            (req as IRequestWithSharpData).sharpImageUrl = await this._getSharpedUrl(req, res) as string;
        
            next();
        } catch (error) {
            const nextError = error instanceof MiddlewareError
                ? error
                : new MiddlewareError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    }

    // Обрезка нескольких изображений
    async sharpImages(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files || !files.length) {
                next("Не переданы файлы");
            }

            Promise
                .all(files.map(async file => {
                    req.file = file;
                    // TODO as написано для того, чтобы не было конфликта типа this._getSharpedUrl (исправиться при рефакторинге ошибок https://tracker.yandex.ru/MESSANGER-7)
                    return await this._getSharpedUrl(req, res) as string;
                }))
                .then(result => {
                    // Сохраняем массив обрезанных изображений
                    (req as IRequestWithImagesSharpData).sharpImagesUrls = result;
                    // Удаляем оригинальные объекты файлов из запроса
                    delete req.files;
                    next();
                })
                .catch(error => {
                    throw new MiddlewareError(`Возникла ошибка при обрезке изображений: ${error}`);
                });
        } catch (error) {
            const nextError = error instanceof MiddlewareError
                ? error
                : new MiddlewareError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    }

    // Получение пути к сжатому изображению
    private async _getSharpedUrl(req: Request, res: Response) {
        try {
            const file = req.file;

            if (!file) {
                return res.status(HTTPStatuses.NotFound).send({ success: false, message: ErrorTextsApi.IMAGE_NOT_GIVEN });
            }

            const { folderPath, outputFile } = await createSharpedFile(file);

            // Удаляем оригинальный объект файла из запроса
            delete req.file;

            return path.join(folderPath, outputFile);
        } catch (error) {
            const nextError = error instanceof MiddlewareError
                ? error
                : new MiddlewareError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    }
}