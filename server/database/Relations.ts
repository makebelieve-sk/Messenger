import Models from "./models/Models";

export default class Relations {
    constructor(private readonly _models: Models) {
        this._oneToOne();
        this._oneToMany();
        this._manyToMany();
    }

    //--------------ONE-TO-ONE----------------------
    // Одно сообщение содержит информацию об одном звонке, и информация об одном звонке может содеражться только в одном сообщении
    private _oneToOne() {
        this._models.calls.hasOne(this._models.messages, { foreignKey: "callId" });
        this._models.messages.belongsTo(this._models.calls, { foreignKey: "callId" });
    }

    //---------------ONE-TO-MANY--------------------
    // Одно сообщение у одного пользователя, но у одного пользователя несколько сообщений
    // Нужно указывать название foreignKey, здесь userId - это поле в MessagesModel по нему идет LEFT OUTER JOIN ON MessagesModel.userId = UserModel.id
    // Поэтому будет работать:
    //      include: [{
    //          model: UserModel,
    //          as: "User",
    //          attributes: ["firstName", "thirdName", "avatarUrl"]
    //      }]
    private _oneToMany() {
        this._models.users.hasMany(this._models.messages, { foreignKey: "userId" });
        this._models.messages.belongsTo(this._models.users, { foreignKey: "userId" });
    
        this._models.chats.hasMany(this._models.messages, { foreignKey: "chatId" });
        this._models.messages.belongsTo(this._models.chats, { foreignKey: "chatId" });
    
        this._models.users.hasMany(this._models.photos, { foreignKey: "userId" });
        this._models.photos.belongsTo(this._models.users, { foreignKey: "userId" });
    
        this._models.users.hasMany(this._models.photos, { foreignKey: "userId" });
        this._models.photos.belongsTo(this._models.users, { foreignKey: "userId" });
    
        this._models.users.hasMany(this._models.usersInChat, { foreignKey: "userId", as: "UsersInChat" });
        this._models.usersInChat.belongsTo(this._models.users, { foreignKey: "userId" });
        this._models.chats.hasMany(this._models.usersInChat, { foreignKey: "chatId", as: "UsersInChat" });
        this._models.usersInChat.belongsTo(this._models.chats, { foreignKey: "chatId" });
    
        this._models.messages.hasMany(this._models.filesInMessage, { foreignKey: "messageId", as: "FilesInMessage" });
        this._models.filesInMessage.belongsTo(this._models.messages, { foreignKey: "messageId" });
        this._models.files.hasMany(this._models.filesInMessage, { foreignKey: "fileId", as: "FilesInMessage" });
        this._models.filesInMessage.belongsTo(this._models.files, { foreignKey: "fileId" });
    
        this._models.users.hasMany(this._models.usersInCall, { foreignKey: "userId", as: "UsersInCall" });
        this._models.usersInCall.belongsTo(this._models.users, { foreignKey: "id" });
        this._models.calls.hasMany(this._models.usersInCall, { foreignKey: "callId", as: "UsersInCall" });
        this._models.usersInCall.belongsTo(this._models.calls, { foreignKey: "id" });
    
        this._models.messages.hasMany(this._models.deletedMessages, { foreignKey: "messageId", as: "DeletedMessages" });
        this._models.deletedMessages.belongsTo(this._models.messages, { foreignKey: "messageId" });
    }

    //---------------MANY-TO-MANY--------------------
    // Несколько пользователей в одном чате, но также несколько чатов у одного пользователя
    // Нужно указывать название смежной таблицы в поле through, в поле foreignKey нужно указывать поле этой смежной таблицы
    private _manyToMany() {
        this._models.users.belongsToMany(this._models.chats, { through: this._models.usersInChat, foreignKey: "userId" });
        this._models.chats.belongsToMany(this._models.users, { through: this._models.usersInChat, foreignKey: "chatId" });
    
        this._models.messages.belongsToMany(this._models.files, { through: this._models.filesInMessage, foreignKey: "messageId" });
        this._models.files.belongsToMany(this._models.messages, { through: this._models.filesInMessage, foreignKey: "fileId" });
    }
};