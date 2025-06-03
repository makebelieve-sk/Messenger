"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const user_1 = __importDefault(require("@core/database/models/user"));
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
;
/**
 * Важный момент: Модель в Sequelize - это сам класс (например, User)
 * Методы по работе с моделью (например, findOne) всегда возвращают экземпляр класса (в нашем случае, это new User())
 * Поэтому тип модели всегда typeof User - то есть тип самого класса.
 * А тип сущности (который возвращается из методов, таких как findOne) - всегда объект (потому что конструктор класса тебе возвращает объект this)
 * с полями и указанными методами (другими словами это typeof new User() - но в Sequelize так делать не нужно и это слишком сложно для понимания,
 * поэтому проще писать просто User).
 */
// Репозиторий, который содержит методы по работе с моделью User
class Users {
    constructor(_repo) {
        this._repo = _repo;
        this._model = (0, user_1.default)(this._repo.sequelize);
    }
    get model() {
        return this._model;
    }
    async create({ creationAttributes, avatarOptions, transaction }) {
        try {
            const { avatarUrl, photoUrl } = avatarOptions;
            const newUser = await this._model.create(creationAttributes, {
                transaction,
            });
            // Создаем объект "Дополнительная информация пользователя" и "Настройки уведомлений пользователя"
            const promises = [
                this._repo.userDetails.create({
                    creationAttributes: { userId: newUser.id },
                    transaction,
                }),
                this._repo.notificationsSettings.create({
                    userId: newUser.id,
                    transaction,
                }),
            ];
            if (avatarUrl && photoUrl) {
                /**
                 * 1) Создаем фотографию (аватар этого пользователя) в таблице Photos.
                 * 2) Создаем фотографию - это дубль аватара, но должна хранится как независимая фотография.
                 * Она хранится в таблицах Photos и UserPhotos.
                 */
                promises.push(this._repo.photos.create({
                    userId: newUser.id,
                    photoPath: avatarUrl,
                    transaction,
                }), this._repo.photos.create({
                    userId: newUser.id,
                    photoPath: photoUrl,
                    transaction,
                }));
            }
            return Promise
                .all(promises)
                .then(async ([newUserDetail, newNotificationSettings, newAvatar, newPhoto]) => {
                if (!newUserDetail || !newNotificationSettings || (!newAvatar && avatarUrl) || (!newPhoto && photoUrl)) {
                    return undefined;
                }
                /**
                 * Если пользователь указал аватар при регистрации, то
                 * создаем фотографию в таблице фотографий пользователя.
                 * Важно! Создаем эту запись после создания записи в таблице Photos, так как используем её id.
                 */
                if (newPhoto && avatarUrl && photoUrl) {
                    await this._repo.userPhotos.create({
                        creationAttributes: {
                            userId: newUser.id,
                            photoId: newPhoto.id,
                        },
                        transaction,
                    });
                }
                // Обновляем аватар в объекте пользователя
                newUser.avatarId = newAvatar?.id || null;
                await newUser.save({ transaction });
                // Получаем объект пользователя с аватаром и безопасными полями
                const userWithAvatar = await this.getUserWithAvatar({
                    user: newUser,
                    transaction,
                });
                return {
                    user: userWithAvatar,
                    userDetails: newUserDetail,
                    notificationSettings: newNotificationSettings,
                };
            });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Users", method: "create" }) + error.message);
        }
    }
    async findOneBy({ filters, transaction }) {
        try {
            return await this._model.findOne({
                where: {
                    ...filters,
                    isDeleted: false,
                },
                transaction,
            });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Users", method: "findOneBy" }) + error.message);
        }
    }
    async getById({ userId, transaction }) {
        try {
            return await this._model.findByPk(userId, { transaction });
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Users", method: "getById" }) + error.message);
        }
    }
    async getUserWithAvatar({ user, transaction }) {
        try {
            if (user.avatarId) {
                const photo = await this._repo.photos.getById({
                    photoId: user.avatarId,
                    transaction,
                });
                if (!photo) {
                    throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.photo_not_found"), common_types_1.HTTPStatuses.NotFound);
                }
                user.avatarUrl = photo.path;
                user.avatarCreateDate = photo.createdAt;
            }
            return user.getEntity();
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "Users", method: "getUserWithAvatar" }) + error.message);
        }
    }
}
exports.default = Users;
//# sourceMappingURL=Users.js.map