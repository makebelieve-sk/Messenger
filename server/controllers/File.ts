import EventEmitter from "events";
import multer from "multer";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import { Op, Transaction } from "sequelize";
import { Request, Response, NextFunction, Express } from "express";

import { ApiRoutes, ErrorTextsApi, HTTPStatuses } from "../types/enums";
import { IUser } from "../types/models.types";
import { IRequestWithImagesSharpData, IRequestWithSharpData } from "../types/express.types";
import { ApiServerEvents } from "../types/events";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { FileError } from "../errors/controllers";
import { ASSETS_PATH } from "../utils/files";
import { currentDate } from "../utils/datetime";

interface IConstructor {
    app: Express;
    middleware: Middleware;
    database: Database;
};

export default class FileController extends EventEmitter {
    private readonly _app: Express;
    private readonly _middleware: Middleware;
    private readonly _database: Database;
    private readonly _uploader = multer({
        storage: multer.memoryStorage()
    });

    constructor({ app, middleware, database }: IConstructor) {
        super();

        this._app = app;
        this._middleware = middleware;
        this._database = database;

        this._init();
    }

    // Слушатели запросов контроллера FileController
    private _init() {
        this._app.post(
            ApiRoutes.saveAvatar, 
            this._uploader.single("avatar"), 
            this._middleware.sharpImage.bind(this._middleware), 
            this._saveAvatar.bind(this)
        );
        this._app.post(ApiRoutes.uploadAvatar, this._uploadAvatar.bind(this));
        this._app.post(
            ApiRoutes.uploadAvatarAuth, 
            this._middleware.mustAuthenticated.bind(this._middleware), 
            this._uploader.single("avatar"), 
            this._middleware.sharpImage.bind(this._middleware), 
            this._uploadAvatarAuth.bind(this)
        );

        this._app.get(ApiRoutes.getPhotos, this._middleware.mustAuthenticated.bind(this._middleware), this._getPhotos.bind(this));
        this._app.post(
            ApiRoutes.savePhotos, 
            this._middleware.mustAuthenticated.bind(this._middleware), 
            this._uploader.array("photo"), 
            this._middleware.sharpImages.bind(this._middleware), 
            this._savePhotos.bind(this)
        );
        this._app.post(ApiRoutes.deleteImage, this._middleware.mustAuthenticated.bind(this._middleware), (req, res, next) => this._deleteImage(req, res, next, undefined));

        this._app.post(ApiRoutes.saveFiles, this._middleware.mustAuthenticated.bind(this._middleware), this._uploader.array("file"), this._saveFiles.bind(this));
        this._app.post(ApiRoutes.deleteFiles, this._middleware.mustAuthenticated.bind(this._middleware), this._deleteFiles.bind(this));
        this._app.post(ApiRoutes.openFile, this._middleware.mustAuthenticated.bind(this._middleware), this._openFile.bind(this));
        this._app.get(ApiRoutes.downloadFile, this._middleware.mustAuthenticated.bind(this._middleware), this._downloadFile.bind(this));
    }

    // Обработка ошибки
    private async _handleError(error: unknown, res: Response, transaction?: Transaction) {
        if (transaction) await transaction.rollback();

        this.emit(ApiServerEvents.ERROR, { error, res });
    }

    // Обрезаем и сохраняем аватар пользователя на диск при регистрации
    private async _saveAvatar(req: Request, res: Response) {
        try {
            return res.json({ success: true, newAvatarUrl: (req as IRequestWithSharpData).sharpImageUrl });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Загрузка аватара в таблицы Photos и Users при регистрации нового пользователя
    private async _uploadAvatar(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { avatarUrl }: { avatarUrl: string; } = req.body;
            const userId = (req.user as IUser).id;

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
    
            return res.json({ success: true });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Установка/смена аватара на главной странице пользователя
    private async _uploadAvatarAuth(req: Request, res: Response, next: NextFunction) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const userId = (req.user as IUser).id;
            const fileUrl = (req as IRequestWithSharpData).sharpImageUrl;
            const dublicateFileUrl = (req as IRequestWithSharpData).dublicateSharpImageUrl;

            if (!fileUrl) {
                throw new FileError(ErrorTextsApi.SHARP_AVATAR_PATH_NOT_FOUND);
            }

            if (!dublicateFileUrl) {
                throw new FileError(ErrorTextsApi.SHARP_PHOTO_PATH_NOT_FOUND);
            }

            const findUser = await this._database.models.users.findByPk(userId, {
                attributes: ["id", "avatarUrl"],
                transaction
            });

            if (!findUser) {
                throw new FileError(ErrorTextsApi.USER_NOT_FOUND, HTTPStatuses.NotFound);
            }

            // Если у пользователя уже существует аватар, то его необходимо удалить из БД и с диска 
            if (findUser.avatarUrl) {
                req.body = {
                    fileUrl: findUser.avatarUrl
                }

                await this._deleteImage(req, res, next, { returnResponse: false, currTransaction: transaction });
            }

            // Обновляем аватар в таблице Users
            await this._database.models.users.update(
                { avatarUrl: fileUrl }, 
                { where: { id: userId }, transaction }
            );

            const newPhotoId = uuid();

            // Добавляем данный аватар в фотографии пользователя
            await this._database.models.photos.create({
                id: newPhotoId,
                userId,
                path: dublicateFileUrl,
                createDate: currentDate
            }, { transaction });

            await transaction.commit();

            return res.json({ success: true, id: newPhotoId, newAvatarUrl: fileUrl, newPhotoUrl: dublicateFileUrl });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Получение всех фотографий пользователя
    private async _getPhotos(req: Request, res: Response) {
        try {
            const userId = (req.user as IUser).id;

            const photos = await this._database.models.photos.findAll({
                where: { userId },
                include: [{
                    model: this._database.models.users,
                    as: "User",
                    attributes: ["firstName", "thirdName", "id", "avatarUrl"]
                }]
            });

            return res.json({ success: true, photos });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Сохраняем фотографии в таблицу Photos
    private async _savePhotos(req: Request, res: Response) {
        try {
            const imagesUrls = (req as IRequestWithImagesSharpData).sharpImagesUrls;
            const userId = (req.user as IUser).id;

            if (!imagesUrls || !imagesUrls.length) {
                throw new FileError(ErrorTextsApi.SHARP_PHOTO_PATHS_NOT_FOUND);
            }

            const photos: { id: string; userId: string; path: string; }[] = imagesUrls.map(fileUrl => ({
                id: uuid(),
                userId,
                path: fileUrl,
                createDate: currentDate
            }));

            await this._database.models.photos.bulkCreate(photos);

            return res.json({ 
                success: true, 
                photos: photos.map(photo => ({
                    ...photo,
                    User: {
                        id: userId,
                        firstName: (req.user as IUser).firstName,
                        thirdName: (req.user as IUser).thirdName,
                        avatarUrl: (req.user as IUser).avatarUrl
                    }
                })) 
            });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Удаление аватара/фотографии из БД и с диска
    private async _deleteImage(req: Request, res: Response, _:NextFunction, params: { returnResponse: boolean; currTransaction?: Transaction } | undefined = { returnResponse: true }) {
        const transaction = params?.currTransaction || await this._database.sequelize.transaction();

        try {
            const { fileUrl, isAvatar = true }: { fileUrl: string; isAvatar: boolean; } = req.body;

            const filePath = path.join(__dirname, ASSETS_PATH, fileUrl);
            const userId = (req.user as IUser).id;

            if (!fileUrl) {
                throw new FileError(ErrorTextsApi.DELETE_PHOTO_PATH_NOT_FOUND);
            }

            if (!fs.existsSync(filePath)) {
                throw new FileError(ErrorTextsApi.PHOTO_NOT_FOUND, HTTPStatuses.NotFound);
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
                    where: { userId, path: fileUrl },
                    transaction
                });
            }

            // Удаление файла с диска
            fs.unlinkSync(filePath);

            if (params.returnResponse) {
                await transaction.commit();
                return res.json({ success: true });
            }
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Сохраняем файлы (req.files) в таблицу Files
    private async _saveFiles(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            if (req.files) {
                const files = req.files as Express.Multer.File[];

                if (files && files.length) {
                    const prepFiles = files.map(file => ({
                        id: uuid(),
                        name: Buffer.from(file.originalname, "latin1").toString("utf8"),
                        path: file.path,
                        size: file.size,
                        extension: file.originalname.split(".").pop()
                    }));

                    // Сохраняем файл в таблицу Files
                    await this._database.models.files.bulkCreate(prepFiles, { transaction });

                    await transaction.commit();

                    return res.json({ success: true, files: prepFiles });
                }
            } else {
                throw new FileError(ErrorTextsApi.FILES_NOT_FOUND);
            }
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Удаляем старые файлы редактируемого сообщения
    private async _deleteFiles(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { messageId }: { messageId: string; } = req.body;

            if (!messageId) {
                throw new FileError(ErrorTextsApi.MESSAGE_ID_NOT_FOUND);
            }

            const findFilesInMessage = await this._database.models.filesInMessage.findAll({
                where: { messageId },
                attributes: ["id", "fileId"],
                transaction
            });

            if (findFilesInMessage && findFilesInMessage.length) {
                const fileIds = findFilesInMessage.map(fileInMessage => fileInMessage.fileId);

                await this._database.models.filesInMessage.destroy({
                    where: { id: { [Op.in]: findFilesInMessage.map(filesInMessage => filesInMessage.id) } },
                    transaction
                });

                const deletedFiles = await this._database.models.files.findAll({
                    where: { id: { [Op.in]: fileIds } },
                    attributes: ["id", "path"],
                    transaction
                });
    
                for (let i = 0; i < deletedFiles.length; i++) {
                    const path = deletedFiles[i].path;
    
                    if (fs.existsSync(path)) {
                        fs.unlinkSync(path);
                    }
                }

                await this._database.models.files.destroy({
                    where: { id: { [Op.in]: fileIds } },
                    transaction
                });
            }

            await transaction.commit();

            return res.json({ success: true });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Открываем файл при клике на него
    private async _openFile(req: Request, res: Response) {
        try {
            const { path }: { path: string; } = req.body;

            if (!path) {
                throw new FileError(ErrorTextsApi.FILE_PATH_OPEN_NOT_FOUND);
            }

            const moduleSpecifier = "open";
            import(moduleSpecifier)
                .then((module) => module(path))
                .then(() => res.json({ success: true }))
                .catch((error: Error) => { throw new FileError(error.message) });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Скачивание файла
    private _downloadFile(req: Request, res: Response) {
        try {
            const { name, path } = req.query as { name: string; path: string; };

            if (!path) {
                throw new FileError(ErrorTextsApi.FILE_PATH_DOWNLOAD_NOT_FOUND);
            }

            if (!fs.existsSync(path)) {
                throw new FileError(ErrorTextsApi.FILE_NOT_FOUND, HTTPStatuses.NotFound);
            }

            return res.download(path, name);
        } catch (error) {
            this._handleError(error, res);
        }
    };
};