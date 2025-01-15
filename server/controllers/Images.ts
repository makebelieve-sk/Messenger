import { Express, Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import multer from "multer";
import { Transaction } from "sequelize";

import { t } from "../service/i18n";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { ApiRoutes, HTTPStatuses } from "../types/enums";
import { IRequestWithShapedImages, IRequestWithSharpedAvatar } from "../types/express.types";
import { ISafeUser } from "../types/user.types";
import { currentDate } from "../utils/datetime";
import { ASSETS_PATH, MB_1 } from "../utils/files";
import { ImagesError } from "../errors/controllers";

const MULTER_MAX_FILE_SIZE = parseInt(process.env.MULTER_MAX_FILE_SIZE as string);
const MULTER_MAX_FILEX_COUNT = parseInt(process.env.MULTER_MAX_FILEX_COUNT as string);

// Класс, отвечающий за API работы с изображениями (аватар/фотографии)
export default class ImagesController {
    // Хранение буфера данных файла в оперативной памяти - может вызвать переполнение - поэтому используется только для изображений + ограничение по размеру и кол-ву изображений
    private readonly _uploader = multer({
        storage: multer.memoryStorage(), // Хранилище файлов
        limits: { 
            fileSize: MB_1 * MULTER_MAX_FILE_SIZE,  // Ограничение на размер одного файла в 10 МБ
            files: MULTER_MAX_FILEX_COUNT           // Ограничение на количество файлов за один запрос
        }
    });

    constructor(private readonly _app: Express, private readonly _middleware: Middleware, private readonly _database: Database) {
        this._init();
    }

    private _init() {
        this._app.post(ApiRoutes.uploadAvatar, this._uploader.single("avatar"), this._middleware.sharpAvatar.bind(this._middleware), this._uploadAvatar);
        this._app.post(ApiRoutes.saveAvatar, this._middleware.mustAuthenticated.bind(this._middleware), this._saveAvatar.bind(this));
        this._app.post(
            ApiRoutes.changeAvatar,
            this._middleware.mustAuthenticated.bind(this._middleware),
            this._uploader.single("avatar"),
            this._middleware.sharpAvatar.bind(this._middleware),
            this._changeAvatar.bind(this)
        );

        this._app.get(ApiRoutes.getPhotos, this._middleware.mustAuthenticated.bind(this._middleware), this._getPhotos.bind(this));
        this._app.post(
            ApiRoutes.savePhotos,
            this._middleware.mustAuthenticated.bind(this._middleware),
            this._uploader.array("photo"),
            this._middleware.sharpImages.bind(this._middleware),
            this._savePhotos.bind(this)
        );
        this._app.post(ApiRoutes.deletePhoto, this._middleware.mustAuthenticated.bind(this._middleware), (req, res, next) => this._deletePhoto(req, res, next));
    }

    // Обрезаем и сохраняем аватар пользователя на диск при регистрации
    private _uploadAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            res.json({ success: true, newAvatarUrl: (req as IRequestWithSharpedAvatar).sharpedAvatarUrl });
        } catch (error) {
            next(error);
        }
    };

    // Сохранение аватара в таблицы Photos и Users после успешной регистрации нового пользователя
    private async _saveAvatar(req: Request, res: Response, next: NextFunction) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { avatarUrl }: { avatarUrl: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            // Добавляем аватар в таблицу Users
            await this._database.models.users.update(
                { avatarUrl }, 
                { where: { id: userId }, transaction }
            );

            // Добавляем данный аватар в фотографии пользователя
            await this._database.models.photos.create({
                id: uuid(),
                userId,
                path: avatarUrl,
                createDate: currentDate
            }, { transaction });

            await transaction.commit();
    
            res.json({ success: true });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Изменение аватара на главной странице пользователя
    private async _changeAvatar(req: Request, res: Response, next: NextFunction) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const userId = (req.user as ISafeUser).id;
            const sharpedAvatarUrl = (req as IRequestWithSharpedAvatar).sharpedAvatarUrl;
            const sharpedPhotoUrl = (req as IRequestWithSharpedAvatar).sharpedPhotoUrl;

            if (!sharpedAvatarUrl) {
                return next(new ImagesError(t("photos.error.sharp_avatar_path_not_found")));
            }

            if (!sharpedPhotoUrl) {
                return next(new ImagesError(t("photos.error.sharp_photo_path_not_found")));
            }

            const findUser = await this._database.models.users.findByPk(userId, {
                attributes: ["id", "avatarUrl"],
                transaction
            });

            if (!findUser) {
                return next(new ImagesError(t("photos.error.user_not_found"), HTTPStatuses.NotFound));
            }

            // Если у пользователя уже существует аватар, то его необходимо удалить из БД и с диска 
            if (findUser.avatarUrl) {
                req.body = {
                    imageUrl: findUser.avatarUrl
                }

                await this._deletePhoto(req, res, next, transaction);
            }

            // Обновляем аватар в таблице Users
            await this._database.models.users.update(
                { avatarUrl: sharpedAvatarUrl }, 
                { where: { id: userId }, transaction }
            );

            const newPhotoId = uuid();

            // Добавляем данный аватар в фотографии пользователя
            await this._database.models.photos.create({
                id: newPhotoId,
                userId,
                path: sharpedPhotoUrl,
                createDate: currentDate
            }, { transaction });

            await transaction.commit();

            res.json({ success: true, id: newPhotoId, newAvatarUrl: sharpedAvatarUrl, newPhotoUrl: sharpedPhotoUrl });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Получение всех фотографий пользователя
    private async _getPhotos(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as ISafeUser).id;

            const photos = await this._database.models.photos.findAll({
                where: { userId },
                include: [{
                    model: this._database.models.users,
                    as: "User",
                    attributes: ["id", "firstName", "thirdName", "avatarUrl"]
                }]
            });

            res.json({ success: true, photos });
        } catch (error) {
            next(error);
        }
    };

    // Сохраняем фотографии в таблицу Photos
    private async _savePhotos(req: Request, res: Response, next: NextFunction) {
        try {
            const imagesUrls = (req as IRequestWithShapedImages).sharpedImageUrls;
            const { id: userId, firstName, thirdName, avatarUrl } = req.user as ISafeUser;

            if (!imagesUrls || !imagesUrls.length) {
                return next(new ImagesError(t("photos.error.sharp_photo_paths_not_found")));
            }

            const photos: { id: string; userId: string; path: string; }[] = imagesUrls.map(imageUrl => ({
                id: uuid(),
                userId,
                path: imageUrl,
                createDate: currentDate
            }));

            await this._database.models.photos.bulkCreate(photos);

            res.json({ 
                success: true, 
                photos: photos.map(photo => ({
                    ...photo,
                    User: {
                        id: userId,
                        firstName,
                        thirdName,
                        avatarUrl
                    }
                })) 
            });
        } catch (error) {
            next(error);
        }
    };

    // Удаление аватара/фотографии из БД и с диска
    private async _deletePhoto(req: Request, res: Response, next: NextFunction, existsTransaction?: Transaction) {
        const transaction = existsTransaction || await this._database.sequelize.transaction();

        try {
            const { imageUrl, isAvatar = true }: { imageUrl: string; isAvatar: boolean; } = req.body;

            const filePath = path.join(__dirname, ASSETS_PATH, imageUrl);
            const userId = (req.user as ISafeUser).id;

            if (!imageUrl) {
                return next(new ImagesError(t("photos.error.delete_photo_path_not_found")));
            }

            if (!fs.existsSync(filePath)) {
                return next(new ImagesError(t("photos.error.photo_not_found"), HTTPStatuses.NotFound));
            }

            // Если это аватар, то удаляем из таблицы Users
            if (isAvatar) {
                await this._database.models.users.update(
                    { avatarUrl: "" },
                    { where: { id: userId }, transaction }
                );
            } else {
                // Удаляем фотографии из таблицы Photos
                await this._database.models.photos.destroy({
                    where: { userId, path: imageUrl },
                    transaction
                });
            }

            // Удаление файла с диска
            fs.unlinkSync(filePath);

            if (!existsTransaction) {
                await transaction.commit();
                res.json({ success: true });
            }
        } catch (error) {
            await transaction.rollback();
            // return нужен для того, чтобы код далее не вызвался
            return next(error);
        }
    };
}