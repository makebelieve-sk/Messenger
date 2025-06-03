"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInChat = void 0;
const sequelize_1 = require("sequelize");
class UserInChat extends sequelize_1.Model {
}
exports.UserInChat = UserInChat;
;
exports.default = (sequelize) => {
    UserInChat.init({
        chatId: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            references: {
                model: "Chats",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            field: "chat_id",
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            field: "user_id",
        },
    }, {
        sequelize,
        name: {
            singular: "UserInChat",
            plural: "UsersInChat",
        },
        modelName: "UserInChat",
        tableName: "Users_in_Chat",
        indexes: [
            { fields: ["chat_id"], name: "IDX_Users_in_Chat_ChatId" },
            { fields: ["user_id"], name: "IDX_Users_in_Chat_UserId" },
        ],
    });
    return UserInChat;
};
//# sourceMappingURL=user-in-chat.js.map