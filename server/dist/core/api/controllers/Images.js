"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const multer_config_1 = __importDefault(require("@config/multer.config"));
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const controllers_1 = require("@errors/controllers");
const constants_1 = require("@utils/constants");
const files_1 = require("@utils/files");
const logger = (0, logger_1.default)("ImagesController");
;
// Класс, отвечающий за API работы с изображениями (аватар/фотографии)
class ImagesController {
    constructor(_app, _middleware, _database) {
        this._app = _app;
        this._middleware = _middleware;
        this._database = _database;
        /**
         * Хранение буфера данных файла в оперативной памяти - это может вызвать переполнение.
         * Поэтому используется только для изображений + ограничение по размеру и кол-ву изображений.
         */
        this._uploader = (0, multer_1.default)(multer_config_1.default);
        this._init();
    }
    _init() {
        this._app.post(common_types_1.ApiRoutes.uploadAvatar, this._uploader.single("avatar"), this._middleware.sharpAvatar.bind(this._middleware), this._uploadAvatar);
        this._app.post(common_types_1.ApiRoutes.changeAvatar, this._middleware.mustAuthenticated.bind(this._middleware), this._uploader.single("avatar"), this._middleware.sharpAvatar.bind(this._middleware), this._changeAvatar.bind(this));
        this._app.post(common_types_1.ApiRoutes.getPhotos, this._middleware.mustAuthenticated.bind(this._middleware), this._getPhotos.bind(this));
        this._app.post(common_types_1.ApiRoutes.savePhotos, this._middleware.mustAuthenticated.bind(this._middleware), this._uploader.array("photo"), this._middleware.sharpImages.bind(this._middleware), this._savePhotos.bind(this));
        this._app.post(common_types_1.ApiRoutes.deletePhoto, this._middleware.mustAuthenticated.bind(this._middleware), (req, res, next) => this._deletePhoto(req, res, next));
    }
    // Обрезаем и сохраняем аватар пользователя на диск при регистрации
    _uploadAvatar(req, res) {
        logger.debug("_uploadAvatar [newAvatarUrl=%s]", req.sharpedAvatarUrl);
        const { sharpedAvatarUrl, sharpedPhotoUrl } = req;
        res.json({
            success: true,
            newAvatar: {
                path: sharpedAvatarUrl,
            },
            newPhoto: {
                path: sharpedPhotoUrl,
            },
        });
    }
    // Изменение аватара на главной странице пользователя
    async _changeAvatar(req, res, next) {
        const transaction = await this._database.sequelize.transaction();
        try {
            const { id: userId } = req.user;
            const { sharpedAvatarUrl, sharpedPhotoUrl } = req;
            logger.debug("_changeAvatar [userId=%s, sharpedAvatarUrl=%s, sharpedPhotoUrl=%s]", userId, sharpedAvatarUrl, sharpedPhotoUrl);
            if (!sharpedAvatarUrl) {
                throw new controllers_1.ImagesError((0, i18n_1.t)("photos.error.sharp_avatar_path_not_found"));
            }
            if (!sharpedPhotoUrl) {
                throw new controllers_1.ImagesError((0, i18n_1.t)("photos.error.sharp_photo_path_not_found"));
            }
            const foundUser = await this._database.repo.users.getById({
                userId,
                transaction,
            });
            if (!foundUser) {
                throw new controllers_1.ImagesError((0, i18n_1.t)("photos.error.user_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            // Получаем объект пользователя с аватаром и безопасными полями
            const foundUserWithAvatar = await this._database.repo.users.getUserWithAvatar({
                user: foundUser,
                transaction,
            });
            // Если у пользователя уже существует аватар, то его необходимо удалить из БД и с диска
            if (foundUserWithAvatar.avatarUrl) {
                await this._deleteImage({
                    userId,
                    imageUrl: foundUserWithAvatar.avatarUrl,
                    isAvatar: true,
                    transaction,
                });
            }
            // Создаем в таблице Photo аватар пользователя
            const newAvatar = await this._database.repo.photos.create({
                userId,
                photoPath: sharpedAvatarUrl,
                transaction,
            });
            // Обновляем только что созданный аватар у пользователя
            foundUser.avatarId = newAvatar.id;
            await foundUser.save({ transaction });
            // Добавляем только что созданный аватар как новую отдельную фотографию в профиль пользователя
            const newPhoto = await this._database.repo.photos.create({
                userId,
                photoPath: sharpedPhotoUrl,
                transaction,
            });
            // Добавляем только что созданную фотографию в связную таблицу User_Photos для связи фотографии и профиля пользователя
            await this._database.repo.userPhotos.create({
                creationAttributes: {
                    userId,
                    photoId: newPhoto.id,
                },
                transaction,
            });
            await transaction.commit();
            res.status(common_types_1.HTTPStatuses.Created).json({
                success: true,
                newAvatar: newAvatar,
                newPhoto,
            });
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    /**
     * Получение всех фотографий пользователя, добавленных в его профиль.
     * Получить фотографии мы можем у разных пользователей, в зависимости от выбранного профиля.
     */
    async _getPhotos(req, res, next) {
        const transaction = await this._database.sequelize.transaction();
        try {
            const { userId, limit, lastCreatedDate } = req.body;
            logger.debug("_getPhotos [userId=%s, lastCreatedDate=%s]", userId, lastCreatedDate);
            const result = await this._database.repo.photos.getUserPhotos({
                filters: { userId },
                options: { limit, lastCreatedDate },
                transaction,
            });
            await transaction.commit();
            res.json({ success: true, ...result });
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    // Сохраняем фотографии в профиль пользователя (фотографии в профиль пользователя может сохранять только сам этот пользователь)
    async _savePhotos(req, res, next) {
        const transaction = await this._database.sequelize.transaction();
        try {
            const { sharpedImageUrls: imagesUrls } = req;
            const { id: userId } = req.user;
            logger.debug("_savePhotos [imagesUrls=%j]", imagesUrls);
            if (!imagesUrls || !imagesUrls.length) {
                throw new controllers_1.ImagesError((0, i18n_1.t)("photos.error.sharp_photo_paths_not_found"));
            }
            // Подготавливаем фотографии для bulkCreate
            const photosCreation = imagesUrls.map(async (imageUrl) => {
                const photoCreation = await (0, files_1.getPhotoInfo)(imageUrl);
                return {
                    ...photoCreation,
                    userId,
                };
            });
            const photos = await Promise.all(photosCreation);
            // Сохраняем фотографии в таблицу Photos
            const createdPhotos = await this._database.repo.photos.bulkCreate({
                photos,
                transaction,
            });
            const userPhotos = createdPhotos.map(photo => ({
                userId,
                photoId: photo.id,
            }));
            // Сохраняем записи только что добавленных фотографий конкретному пользователю
            await this._database.repo.userPhotos.bulkCreate({
                records: userPhotos,
                transaction,
            });
            await transaction.commit();
            res.status(common_types_1.HTTPStatuses.Created).json({
                success: true,
                photos: createdPhotos.map(photo => photo.getEntity()),
            });
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    // Удаление аватара/фотографии из БД и с диска
    async _deletePhoto(req, res, next) {
        const transaction = await this._database.sequelize.transaction();
        try {
            const { imageUrl, isAvatar = true } = req.body;
            const { id: userId } = req.user;
            logger.debug("_deletePhoto [imageUrl=%s, isAvatar=%s]", imageUrl, isAvatar);
            if (!imageUrl) {
                throw new controllers_1.ImagesError((0, i18n_1.t)("photos.error.delete_photo_path_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            await this._deleteImage({ userId, imageUrl, isAvatar, transaction });
            await transaction.commit();
            /**
             * Обязательно добавляем end для того, чтобы запрос был закрыт и до конца обработан.
             * Так как в этом случае мы не возвращаем никакие данные и просто установка статуса NoContent
             * лишь позволит запросу зависнуть в необработанном состоянии
             */
            res.status(common_types_1.HTTPStatuses.NoContent).end();
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    // Общая функция удаления фотографии/аватара из БД и из диска
    async _deleteImage({ userId, imageUrl, isAvatar, transaction }) {
        logger.debug("_deleteImage [userId=%s, imageUrl=%s, isAvatar=%s]", userId, imageUrl, isAvatar);
        try {
            const filePath = path_1.default.join(__dirname, "../../../", constants_1.ASSETS_DIR, imageUrl);
            if (!fs_1.default.existsSync(filePath)) {
                throw new controllers_1.ImagesError((0, i18n_1.t)("photos.error.photo_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            if (isAvatar) {
                const user = await this._database.repo.users.getById({
                    userId,
                    transaction,
                });
                if (!user) {
                    throw new controllers_1.ImagesError((0, i18n_1.t)("photos.error.user_not_found"), common_types_1.HTTPStatuses.NotFound);
                }
                // Удаляем аватар из таблицы Photos
                await this._database.repo.photos.destroy({
                    filters: { userId: user.id, path: imageUrl },
                    transaction,
                });
            }
            else {
                // Удаляем фотографию или предыдущий аватар из таблицы Photos
                const photoId = await this._database.repo.photos.returnDestroyedRow({
                    filters: { userId, path: imageUrl },
                    transaction,
                });
                // Удаляем запись из связной таблицы User_Photos
                await this._database.repo.userPhotos.destroy({
                    filters: { userId, photoId },
                    transaction,
                });
            }
            // Удаление файла с диска
            fs_1.default.unlinkSync(filePath);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = ImagesController;
//# sourceMappingURL=Images.js.map