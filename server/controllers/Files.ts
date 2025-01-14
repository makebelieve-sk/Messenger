import multer from "multer";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { Op } from "sequelize";
import { Request, Response, NextFunction, Express } from "express";

import { t } from "../service/i18n";
import { ApiRoutes, HTTPStatuses } from "../types/enums";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { FilesError } from "../errors/controllers";
import { MB_1 } from "../utils/files";

const MULTER_MAX_FILE_SIZE = parseInt(process.env.MULTER_MAX_FILE_SIZE as string);
const MULTER_MAX_FILEX_COUNT = parseInt(process.env.MULTER_MAX_FILEX_COUNT as string);

// Класс, отвечающий за API работы с файлами
export default class FilesController {
    private readonly _uploader = multer({
        storage: multer.memoryStorage(), // Хранилище файлов (либо дисковое пространство, либо хранение буфера данных файла в оперативной памяти - может вызвать переполнение!)
        limits: { 
            fileSize: MB_1 * MULTER_MAX_FILE_SIZE,  // Ограничение на размер одного файла в 10 МБ
            files: MULTER_MAX_FILEX_COUNT           // Ограничение на количество файлов за один запрос
        }
    });

    constructor(private readonly _app: Express, private readonly _middleware: Middleware, private readonly _database: Database) {
        this._init();
    }

    // Слушатели запросов контроллера FileController
    private _init() {
        this._app.post(ApiRoutes.saveFiles, this._middleware.mustAuthenticated.bind(this._middleware), this._uploader.array("file"), this._saveFiles.bind(this));
        this._app.post(ApiRoutes.deleteFiles, this._middleware.mustAuthenticated.bind(this._middleware), this._deleteFiles.bind(this));
        this._app.post(ApiRoutes.openFile, this._middleware.mustAuthenticated.bind(this._middleware), this._openFile);
        this._app.get(ApiRoutes.downloadFile, this._middleware.mustAuthenticated.bind(this._middleware), this._downloadFile);
    }

    // Сохраняем файлы (req.files) в таблицу Files
    private async _saveFiles(req: Request, res: Response, next: NextFunction) {
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

                    res.json({ success: true, files: prepFiles });
                }
            } else {
                return next(new FilesError(t("files.error.files_not_found")));
            }
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Удаляем старые файлы редактируемого сообщения
    private async _deleteFiles(req: Request, res: Response, next: NextFunction) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { messageId }: { messageId: string; } = req.body;

            if (!messageId) {
                return next(new FilesError(t("files.error.message_id_not_found"), HTTPStatuses.BadRequest));
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

            res.json({ success: true });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Открываем файл при клике на него
    private _openFile(req: Request, res: Response, next: NextFunction) {
        const { path }: { path: string; } = req.body;

        if (!path) {
            return next(new FilesError(t("files.error.file_path_open_not_found"), HTTPStatuses.BadRequest));
        }

        const moduleSpecifier = "open";
        import(moduleSpecifier)
            .then((module) => module(path))
            .then(() => res.json({ success: true }))
            .catch((error: Error) => { return next(new FilesError(error.message)) });
    };

    // Скачивание файла
    private _downloadFile(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, path } = req.query as { name: string; path: string; };

            if (!path) {
                return next(new FilesError(t("files.error.file_path_download_not_found"), HTTPStatuses.BadRequest));
            }

            if (!fs.existsSync(path)) {
                return next(new FilesError(t("files.error.file_not_found"), HTTPStatuses.NotFound));
            }

            res.download(path, name);
        } catch (error) {
            next(error);
        }
    };
};