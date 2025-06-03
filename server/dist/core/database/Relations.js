"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@service/logger"));
const associations_1 = __importDefault(require("@utils/associations"));
const logger = (0, logger_1.default)("Relations");
// Класс, предоставляет отношения между таблицами для корректной работы ORM Sequelize
class Relations {
    constructor(_repo) {
        this._repo = _repo;
        logger.debug("init");
        this._oneToOne();
        this._oneToMany();
        this._manyToMany();
    }
    /**
     * --------------ONE-TO-ONE----------------------
     * Одно сообщение содержит информацию об одном звонке, и информация об одном звонке может содеражться только в одном сообщении
     * При ассоциации A.belongsTo(B) foreignKey находится в исходной модели A
     * При ассоциации A.hasOne(B) foreignKey находится в целевой модели B
     */
    _oneToOne() {
        // Ассоциация одного аватара пользователя и одной фотографии
        this._repo.users.model.belongsTo(this._repo.photos.model, {
            foreignKey: "avatarId",
            onDelete: "SET NULL",
            as: associations_1.default.USER_WITH_AVATAR,
        });
        this._repo.photos.model.hasOne(this._repo.users.model, {
            foreignKey: "avatarId",
            onDelete: "SET NULL",
            as: associations_1.default.AVATAR_WITH_USER,
        });
        // Ассоциация одной доп. информации пользователя и самого пользователя
        this._repo.users.model.hasOne(this._repo.userDetails.model, {
            foreignKey: "userId",
            onDelete: "CASCADE",
        });
        this._repo.userDetails.model.belongsTo(this._repo.users.model, {
            foreignKey: "userId",
            onDelete: "CASCADE",
        });
        // Ассоциация одних общих настроек пользователя и самого пользователя
        this._repo.users.model.hasOne(this._repo.notificationsSettings.model, {
            foreignKey: "userId",
            onDelete: "CASCADE",
        });
        this._repo.notificationsSettings.model.belongsTo(this._repo.users.model, {
            foreignKey: "userId",
            onDelete: "CASCADE",
        });
        // Ассоциация одного аватара чата и одной фотографии
        this._repo.photos.model.hasOne(this._repo.chats.model, {
            foreignKey: "avatarId",
            onDelete: "SET NULL",
            as: associations_1.default.AVATAR_WITH_CHAT,
        });
        this._repo.chats.model.belongsTo(this._repo.photos.model, {
            foreignKey: "avatarId",
            onDelete: "SET NULL",
            as: associations_1.default.CHAT_WITH_AVATAR,
        });
    }
    /**
     * ---------------ONE-TO-MANY--------------------
     * Одно сообщение у одного пользователя, но у одного пользователя несколько сообщений
     * При ассоциации A.belongsTo(B) foreignKey находится в исходной модели A
     * При ассоциации A.hasMany(B) foreignKey находится в целевой модели B
     */
    _oneToMany() {
        // Ассоциация одного пользователя и истории всех его отправленных/принятых запросов дружбы (блокировка/подписывания/отписывание и тд)
        this._repo.users.model.hasMany(this._repo.friendActions.model, {
            foreignKey: "sourceUserId",
            onDelete: "CASCADE",
            as: associations_1.default.SENT_FRIEND_REQUESTS,
        });
        this._repo.friendActions.model.belongsTo(this._repo.users.model, {
            foreignKey: "sourceUserId",
            onDelete: "CASCADE",
            as: associations_1.default.SOURCE_USER,
        });
        // Если здесь работать не будет, переделать на no action
        this._repo.users.model.hasMany(this._repo.friendActions.model, {
            foreignKey: "targetUserId",
            onDelete: "CASCADE",
            as: associations_1.default.RECEIVED_FRIEND_REQUESTS,
        });
        // Если здесь работать не будет, переделать на no action
        this._repo.friendActions.model.belongsTo(this._repo.users.model, {
            foreignKey: "targetUserId",
            onDelete: "CASCADE",
            as: associations_1.default.TARGET_USER,
        });
        // Ассоциация одного пользователя и всех его сообщений во всех чатах
        this._repo.users.model.hasMany(this._repo.messages.model, {
            foreignKey: "userId",
            onDelete: "NO ACTION",
            as: associations_1.default.USER_WITH_MESSAGE,
        });
        this._repo.messages.model.belongsTo(this._repo.users.model, {
            foreignKey: "userId",
            onDelete: "NO ACTION",
            as: associations_1.default.MESSAGE_WITH_USER,
        });
        // Ассоциация одного чата и всех его сообщений
        this._repo.chats.model.hasMany(this._repo.messages.model, {
            foreignKey: "chatId",
            onDelete: "CASCADE",
        });
        this._repo.messages.model.belongsTo(this._repo.chats.model, {
            foreignKey: "chatId",
            onDelete: "CASCADE",
        });
        // Ассоциация одного пользователя и всех его прикрепленных файлов
        this._repo.users.model.hasMany(this._repo.files.model, {
            foreignKey: "userId",
            onDelete: "NO ACTION",
        });
        this._repo.files.model.belongsTo(this._repo.users.model, {
            foreignKey: "userId",
            onDelete: "NO ACTION",
        });
    }
    /**
     * ---------------MANY-TO-MANY--------------------
     * По умолчанию для onUpdate: "SET NULL" и onDelete: "CASCADE"
     * При ассоциации A.belongsToMany(B, { through: C }) foreignKey находится в связной модели C и ссылается на id модели A
     */
    _manyToMany() {
        // Ассоциация одного пользователя и всех его добавленных фотографии в своем профиле
        // Если здесь работать не будет, переделать на no action
        this._repo.users.model.belongsToMany(this._repo.photos.model, {
            through: this._repo.userPhotos.model,
            foreignKey: "userId",
            otherKey: "photoId",
            as: associations_1.default.USER_WITH_PHOTOS,
        });
        this._repo.photos.model.belongsToMany(this._repo.users.model, {
            through: this._repo.userPhotos.model,
            foreignKey: "photoId",
            otherKey: "userId",
            as: associations_1.default.PHOTOS_WITH_USER,
        });
        // Ассоциация одного пользователя и всех его чатов, в которых он выключил уведомления
        this._repo.users.model.belongsToMany(this._repo.chats.model, {
            through: this._repo.disabledChatsSound.model,
            foreignKey: "userId",
            otherKey: "chatId",
            as: associations_1.default.USERS_WITH_DISABLED_CHATS_SOUND,
        });
        this._repo.chats.model.belongsToMany(this._repo.users.model, {
            through: this._repo.disabledChatsSound.model,
            foreignKey: "chatId",
            otherKey: "userId",
            as: associations_1.default.CHATS_DISABLED_SOUND_WITH_USERS,
        });
        // Ассоциация одного пользователя и всех его чатов, в которых он состоит
        this._repo.users.model.belongsToMany(this._repo.chats.model, {
            through: this._repo.usersInChat.model,
            foreignKey: "userId",
            otherKey: "chatId",
            as: associations_1.default.USERS_WITH_CHATS,
        });
        this._repo.chats.model.belongsToMany(this._repo.users.model, {
            through: this._repo.usersInChat.model,
            foreignKey: "chatId",
            otherKey: "userId",
            as: associations_1.default.CHATS_WITH_USERS,
        });
        // Ассоциация одного пользователя и всех его сообщений, с которыми он может взаимодействовать (удалять/читать и тд)
        // Если здесь работать не будет, переделать на no action
        this._repo.users.model.belongsToMany(this._repo.messages.model, {
            through: this._repo.userMessageStatuses.model,
            foreignKey: "userId",
            otherKey: "messageId",
            as: associations_1.default.USERS_WITH_MESSAGES_STATUSES,
        });
        this._repo.messages.model.belongsToMany(this._repo.users.model, {
            through: this._repo.userMessageStatuses.model,
            foreignKey: "messageId",
            otherKey: "userId",
            as: associations_1.default.MESSAGES_STATUSES_WITH_USERS,
        });
        // Ассоциация одного сообщения и всех его фотографий, которые прикреплены в это сообщение
        this._repo.photos.model.belongsToMany(this._repo.messages.model, {
            through: this._repo.photosInMessage.model,
            foreignKey: "photoId",
            otherKey: "messageId",
        });
        this._repo.messages.model.belongsToMany(this._repo.photos.model, {
            through: this._repo.photosInMessage.model,
            foreignKey: "messageId",
            otherKey: "photoId",
        });
        // Ассоциация одного сообщения и всех его файлов, которые прикреплены в это сообщение
        this._repo.files.model.belongsToMany(this._repo.messages.model, {
            through: this._repo.filesInMessage.model,
            foreignKey: "fileId",
            otherKey: "messageId",
        });
        this._repo.messages.model.belongsToMany(this._repo.files.model, {
            through: this._repo.filesInMessage.model,
            foreignKey: "messageId",
            otherKey: "fileId",
        });
    }
}
exports.default = Relations;
//# sourceMappingURL=Relations.js.map