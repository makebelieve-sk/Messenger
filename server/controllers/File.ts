import multer from "multer";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { Op, Transaction } from "sequelize";
import { Request, Response, NextFunction, Express } from "express";

import { ApiRoutes, ErrorTextsApi, HTTPStatuses } from "../types/enums";
import { IUser } from "../types/models.types";
import Middleware from "../core/Middleware";
import Database from "../core/Database";

interface IConstructor {
    app: Express;
    middleware: Middleware;
    database: Database;
};

export default class FileController {
    private _app: Express;
    private _middleware: Middleware;
    private _database: Database;

    constructor({ app, middleware, database }: IConstructor) {
        this._app = app;
        this._middleware = middleware;
        this._database = database;

        this._init();
    }

    // Слушатели запросов контроллера FileController
    private _init() {
        this._app.post(ApiRoutes.saveAvatar, this._uploader.single("avatar"), this._saveAvatar.bind(this));
        this._app.post(ApiRoutes.uploadAvatar, this._uploader.single("avatar"), this._uploadAvatar.bind(this));
        this._app.post(ApiRoutes.uploadAvatarAuth, this._middleware.mustAuthenticated.bind(this), this._uploader.single("avatar"), this._uploadAvatarAuth.bind(this));

        this._app.get(ApiRoutes.getPhotos, this._middleware.mustAuthenticated.bind(this), this._getPhotos.bind(this));
        this._app.post(ApiRoutes.savePhotos, this._middleware.mustAuthenticated.bind(this), this._uploader.array("photo"), this._savePhotos.bind(this));
        this._app.post(ApiRoutes.deleteImage, this._middleware.mustAuthenticated.bind(this), (req, res, next) => this._deleteImage(req, res, next, undefined));

        this._app.post(ApiRoutes.saveFiles, this._middleware.mustAuthenticated.bind(this), this._uploader.array("file"), this._saveFiles.bind(this));
        this._app.post(ApiRoutes.deleteFiles, this._middleware.mustAuthenticated.bind(this), this._deleteFiles.bind(this));
        this._app.post(ApiRoutes.openFile, this._middleware.mustAuthenticated.bind(this), this._openFile.bind(this));
        this._app.get(ApiRoutes.downloadFile, this._middleware.mustAuthenticated.bind(this), this._downloadFile.bind(this));
    }

    // Обработка multipart формата (файлы) пакетом multer
    private _uploader = multer({
        storage: multer.diskStorage({
            // Создание и проверка директории
            destination: function (_, file, callback) {
                const folder = `server/assets/${file.fieldname}s/`;

                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder);
                }

                callback(null, folder);
            },
            // Создание файла в директории
            filename: function (_, file, callback) {
                callback(null, file.fieldname + "-" + uuid() + "." + file.mimetype.split("/").pop());
            }
        })
    });

    // Сохраняем аватар при его выборе при регистрации нового пользователя (req.file)
    private _saveAvatar(req: Request, res: Response) {
        try {
            if (!req.file) {
                throw new Error("В req.file не передано изображение с аватаром");
            }
    
            const file = req.file;
    
            return res.json({ success: true, url: `/${file.fieldname}s/${file.filename}` });
        } catch (error: any) {
            console.log(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };

    // Загрузка аватара при регистрации нового пользователя (req.file)
    private async _uploadAvatar(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { avatarUrl } = req.body as { avatarUrl: string; };
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
                path: avatarUrl
            }, { transaction });

            await transaction.commit();
    
            return res.json({ success: true });
        } catch (error: any) {
            console.log(error);
            await transaction.rollback();
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };

    // Установка/смена аватара на главной странице (req.file)
    private async _uploadAvatarAuth(req: Request, res: Response, next: NextFunction) {
        const transaction = await this._database.sequelize.transaction();

        try {
            // Если пользователь не передан при установке/смене аватара на своей странице - выдаем ошибку
            if (!req.user) {
                await transaction.rollback();
                return res.status(HTTPStatuses.NotFound).send({ success: false, message: ErrorTextsApi.USER_NOT_FOUND });
            }

            if (!req.file) {
                throw new Error("В req.file не передано изображение с аватаром");
            }

            const file = req.file;
            const userId = (req.user as IUser).id;
            const fileUrl = "/" + file.destination.split("/")[1] + "/" + file.filename;

            if (!userId) {
                throw "Не найден идентификатор пользователя";
            }

            if (!file) {
                throw "Не передан изображение с аватаром";
            }

            const findUser = await this._database.models.users.findByPk(userId, {
                attributes: ["id", "avatarUrl"],
                transaction
            });

            if (!findUser) {
                await transaction.rollback();
                return res.status(HTTPStatuses.NotFound).send({ success: false, message: ErrorTextsApi.USER_NOT_FOUND });
            }

            // Если у пользователя уже существует аватар, то его необходимо удалить из БД и с диска 
            if (findUser.avatarUrl) {
                req.body = {
                    isAvatar: true,
                    path: findUser.avatarUrl,
                    returnResponse: false
                }

                await this._deleteImage(req, res, next, { returnResponse: false, currTransaction: transaction });
            }

            // Обновляем аватар в таблице Users
            await this._database.models.users.update(
                { avatarUrl: fileUrl }, 
                { where: { id: userId }, transaction }
            );

            // Добавляем данный аватар в фотографии пользователя
            await this._database.models.photos.create({
                id: uuid(),
                userId,
                path: fileUrl
            }, { transaction });

            await transaction.commit();

            return res.json({ success: true, url: `/${file.fieldname}s/${file.filename}` });
        } catch (error: any) {
            console.log(error);
            await transaction.rollback();
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };

    // Получение всех фотографий пользователя
    private async _getPhotos(req: Request, res: Response) {
        try {
            const userId = (req.user as IUser).id;

            if (!userId) {
                throw "Не найден идентификатор пользователя";
            }

            const photos = await this._database.models.photos.findAll({
                where: { userId }
            });

            return res.json({ success: true, photos });
        } catch (error: any) {
            console.log(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };

    // Сохраняем файлы (req.files) в таблицу Photos
    private async _savePhotos(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            if (req.files) {
                const images = req.files as Express.Multer.File[];
                const userId = (req.user as IUser).id;

                if (!userId) {
                    throw "Не найден идентификатор пользователя";
                }

                if (images && images.length) {
                    const photos: { id: string; userId: string; path: string; }[] = images.map(image => ({
                        id: uuid(),
                        userId,
                        path: image.path.slice(6)
                    }));

                    await this._database.models.photos.bulkCreate(photos, { transaction });

                    await transaction.commit();

                    return res.json({ success: true, photos });
                }
            } else {
                throw "Не переданы изображения";
            }
        } catch (error: any) {
            console.log(error);
            await transaction.rollback();
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };

    // Удаление аватара/фотографии
    private async _deleteImage(req: Request, res: Response, _:NextFunction, params: { returnResponse: boolean; currTransaction?: Transaction } | undefined = { returnResponse: true }) {
        const transaction = params?.currTransaction || await this._database.sequelize.transaction();

        try {
            const { path, isAvatar = false } = req.body as { path: string; isAvatar: boolean; };

            const filePath = "app/public" + path;
            const userId = (req.user as IUser).id;

            if (!userId) {
                throw "Не найден идентификатор пользователя";
            }

            if (!filePath) {
                throw "Не передан путь для удаления изображения";
            }

            if (!fs.existsSync(filePath)) {
                await transaction.rollback();
                return res.status(HTTPStatuses.NotFound).send({ success: false, message: ErrorTextsApi.IMAGE_NOT_FOUND });
            }

            // Если это аватар, то удаляем из таблицы Users
            if (isAvatar) {
                await this._database.models.users.update(
                    { avatarUrl: "" },
                    { where: { id: userId }, transaction }
                );
            }

            // Удаляем фотографии из таблицы Photos
            await this._database.models.photos.destroy({
                where: { userId, path },
                transaction
            });

            // Удаление файла с диска
            fs.unlinkSync(filePath);

            if (params.returnResponse) {
                await transaction.commit();
                return res.json({ success: true });
            }
        } catch (error: any) {
            console.log(error);
            await transaction.rollback();
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
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
                throw "Не переданы файлы";
            }
        } catch (error: any) {
            console.log(error);
            await transaction.rollback();
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };

    // Удаляем старые файлы редактируемого сообщения
    private async _deleteFiles(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { messageId }: { messageId: string; } = req.body;

            if (!messageId) {
                throw "Не передан уникальный идентификатор сообщения";
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
        } catch (error: any) {
            console.log(error);
            await transaction.rollback();
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };

    // Открываем файл при клике на него
    private async _openFile(req: Request, res: Response) {
        try {
            const { path }: { path: string; } = req.body;

            if (!path) {
                throw "Не передан путь для открытия файла";
            }

            const moduleSpecifier = "open";
            import(moduleSpecifier)
                .then((module) => module(path))
                .then(() => res.json({ success: true }))
                .catch(error => { throw error });
        } catch (error: any) {
            console.log(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };

    // Скачивание файла
    private _downloadFile(req: Request, res: Response) {
        try {
            const { name, path } = req.query as unknown as { name: string; path: string; };

            if (!path) {
                throw "Не передан путь для скачивания файла";
            }

            if (fs.existsSync(path)) {
                return res.download(path, name);
            } else {
                return res.status(HTTPStatuses.NotFound).send({ success: false, message: ErrorTextsApi.FILE_NOT_FOUND });
            }
        } catch (error: any) {
            console.log(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };
};