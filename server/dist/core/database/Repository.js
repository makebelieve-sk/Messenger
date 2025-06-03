"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const sequelize_1 = require("sequelize");
const Chats_1 = __importDefault(require("@core/database/repositories/Chats"));
const DisabledChatsSound_1 = __importDefault(require("@core/database/repositories/DisabledChatsSound"));
const Files_1 = __importDefault(require("@core/database/repositories/Files"));
const FilesInMessage_1 = __importDefault(require("@core/database/repositories/FilesInMessage"));
const FriendActions_1 = __importDefault(require("@core/database/repositories/FriendActions"));
const Messages_1 = __importDefault(require("@core/database/repositories/Messages"));
const NotificationsSettings_1 = __importDefault(require("@core/database/repositories/NotificationsSettings"));
const Photos_1 = __importDefault(require("@core/database/repositories/Photos"));
const PhotosInMessage_1 = __importDefault(require("@core/database/repositories/PhotosInMessage"));
const UserDetails_1 = __importDefault(require("@core/database/repositories/UserDetails"));
const UserMessageStatuses_1 = __importDefault(require("@core/database/repositories/UserMessageStatuses"));
const UserPhotos_1 = __importDefault(require("@core/database/repositories/UserPhotos"));
const Users_1 = __importDefault(require("@core/database/repositories/Users"));
const UsersInChat_1 = __importDefault(require("@core/database/repositories/UsersInChat"));
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
// Класс, содержит доступы ко всем таблицам базы данных
class Repository {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
        this._users = new Users_1.default(this);
        this._photos = new Photos_1.default(this);
        this._userDetails = new UserDetails_1.default(this._sequelize);
        this._userPhotos = new UserPhotos_1.default(this._sequelize);
        this._notificationsSettings = new NotificationsSettings_1.default(this._sequelize);
        this._friendActions = new FriendActions_1.default(this);
        this._chats = new Chats_1.default(this._sequelize);
        this._disabledChatsSound = new DisabledChatsSound_1.default(this._sequelize);
        this._usersInChat = new UsersInChat_1.default(this._sequelize);
        this._messages = new Messages_1.default(this._sequelize);
        this._userMessageStatuses = new UserMessageStatuses_1.default(this._sequelize);
        this._photosInMessage = new PhotosInMessage_1.default(this._sequelize);
        this._files = new Files_1.default(this._sequelize);
        this._filesInMessage = new FilesInMessage_1.default(this._sequelize);
    }
    get sequelize() {
        return this._sequelize;
    }
    get users() {
        return this._users;
    }
    get photos() {
        return this._photos;
    }
    get userDetails() {
        return this._userDetails;
    }
    get userPhotos() {
        return this._userPhotos;
    }
    get notificationsSettings() {
        return this._notificationsSettings;
    }
    get friendActions() {
        return this._friendActions;
    }
    get chats() {
        return this._chats;
    }
    get disabledChatsSound() {
        return this._disabledChatsSound;
    }
    get usersInChat() {
        return this._usersInChat;
    }
    get messages() {
        return this._messages;
    }
    get userMessageStatuses() {
        return this._userMessageStatuses;
    }
    get photosInMessage() {
        return this._photosInMessage;
    }
    get files() {
        return this._files;
    }
    get filesInMessage() {
        return this._filesInMessage;
    }
    // Общий метод популяции пользователя (то есть по мимо полного объекта пользователя здесь подугружается еще доп. информация и его настройки уведомлений)
    async populateUser({ userId, transaction }) {
        try {
            const userDetails = await this._userDetails.findOneBy({
                filters: { userId },
                transaction,
            });
            if (!userDetails) {
                throw new index_1.RepositoryError((0, i18n_1.t)("users.error.user_details_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            const notificationSettings = await this._notificationsSettings.findOneBy({
                filters: { userId },
                transaction,
            });
            if (!notificationSettings) {
                throw new index_1.RepositoryError((0, i18n_1.t)("users.error.notifications_settings_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            return { userDetails, notificationSettings };
        }
        catch (error) {
            const nextError = error instanceof index_1.RepositoryError ? error : new index_1.RepositoryError(error.message);
            throw nextError;
        }
    }
    // Общий метод удаления учетной записи пользователя
    async deleteUser({ userId, transaction }) {
        try {
            /**
             * Сообщения пользователя, саму запись пользователя и его чаты не трогаем.
             * Должна остатся возможность посмотреть сообщения этого удаленного пользователя остальным участникам чата.
             * При входе в приватные чаты (где были два пользователя, один из которых удаленный) должна быть пометка
             * о том, что этот пользователь удален и данный чат остался только для чтения.
             */
            // Удаляем все записи из статусов сообщений в чатах
            await this._userMessageStatuses.destroy({
                filters: { userId },
                transaction,
            });
            // Удаляем все записи из конкретных настроек чатов
            await this._disabledChatsSound.destroy({
                filters: { userId },
                transaction,
            });
            // Удаляем все записи из журнала дружбы с другими пользователями
            await this._friendActions.destroy({
                filters: { [sequelize_1.Op.or]: [
                        { sourceUserId: userId },
                        { targetUserId: userId },
                    ] },
                transaction,
            });
            // Удаляем все записи из глобальных настроек
            await this._notificationsSettings.destroy({
                filters: { userId },
                transaction,
            });
            // Удаляем все записи из фотографий пользователя
            await this._userPhotos.destroy({
                filters: { userId },
                transaction,
            });
            // Удаляем все записи из всего списка фотографий
            await this._userDetails.destroy({
                filters: { userId },
                transaction,
            });
            const user = await this._users.getById({ userId, transaction });
            if (!user) {
                throw new index_1.RepositoryError((0, i18n_1.t)("users.error.user_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            // Помечаем такого пользователя как удаленного
            user.isDeleted = true;
            await user.save({ transaction });
        }
        catch (error) {
            const nextError = error instanceof index_1.RepositoryError ? error : new index_1.RepositoryError(error.message);
            throw nextError;
        }
    }
}
exports.default = Repository;
//# sourceMappingURL=Repository.js.map