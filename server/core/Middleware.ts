import { Request, Response, NextFunction } from "express";
import path from "path";

import { ErrorTextsApi, HTTPStatuses, RedisKeys } from "../types/enums";
import { IUser } from "../types/models.types";
import { IRequestWithImagesSharpData, IRequestWithParams, IRequestWithSharpData } from "../types/express.types";
import { getExpiredToken } from "../utils/token";
import RedisWorks from "./Redis";
import { MiddlewareError } from "../errors";
import { createSharpedFile } from "../utils/files";

export default class Middleware {
    constructor(private readonly _redisWork: RedisWorks) {}

    // Установка параметров сжатия изображений в req
    public setSharpParams(req: Request, res: Response, next: NextFunction) {
        try {
            (req as IRequestWithParams).goNext = true;
            (req as IRequestWithParams).dublicateToPhotoFile = true;
            next();
        } catch (error) {
            const nextError = error instanceof MiddlewareError
                ? error
                : new MiddlewareError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    }

    // Пользователь должен быть авторизован в системе
    public async mustAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(HTTPStatuses.Unauthorized).send({ success: false, message: ErrorTextsApi.NOT_AUTH_OR_TOKEN_EXPIRED });
            }

            const userId = (req.user as IUser).id;

            // Получаем поле rememberMe из Redis
            const rememberMe = await this._redisWork.get(RedisKeys.REMEMBER_ME, userId);
        
            // Обновляем время жизни токена сессии
            req.session.cookie.expires = getExpiredToken(Boolean(rememberMe));
        
            next();
        } catch (error) {
            const nextError = error instanceof MiddlewareError
                ? error
                : new MiddlewareError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    }

    // Обрезка одного изображения
    public async sharpImage(req: Request, res: Response, next: NextFunction) {
        try {
            const file = req.file;

            if (!file) {
                return res.status(HTTPStatuses.NotFound).send({ success: false, message: ErrorTextsApi.IMAGE_NOT_GIVEN });
            }

            const { folderPath, outputFile } = await createSharpedFile(file);

            (req as IRequestWithSharpData).sharpImageUrl = path.join(folderPath, outputFile);

            if ((req as IRequestWithSharpData).dublicateToPhotoFile) {
                const { folderPath, outputFile } = await createSharpedFile({ ...file, fieldname: "photo" });
                (req as IRequestWithSharpData).dublicateSharpImageUrl = path.join(folderPath, outputFile);
            }

            // Удаляем оригинальный объект файла из запроса
            delete req.file;
        
            if ((req as IRequestWithSharpData).goNext) next();
        } catch (error) {
            const nextError = error instanceof MiddlewareError
                ? error
                : new MiddlewareError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    }

    // Обрезка нескольких изображений
    public async sharpImages(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files || !files.length) {
                next("Не переданы файлы");
            }

            (req as IRequestWithImagesSharpData).sharpImagesUrls = [];

            for (const file of files) {
                req.file = file;
                (req as IRequestWithParams).goNext = false;
                await this.sharpImage(req, res, next);
                (req as IRequestWithImagesSharpData).sharpImagesUrls.push((req as IRequestWithSharpData).sharpImageUrl);
            }

            // Удаляем оригинальные объекты файлов из запроса
            delete req.files;

            next();
        } catch (error) {
            const nextError = error instanceof MiddlewareError
                ? error
                : new MiddlewareError(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: nextError.message });
        }
    }
}