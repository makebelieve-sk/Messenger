"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisabledChatSound = void 0;
const sequelize_1 = require("sequelize");
class DisabledChatSound extends sequelize_1.Model {
}
exports.DisabledChatSound = DisabledChatSound;
;
exports.default = (sequelize) => {
    DisabledChatSound.init({
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
    }, {
        sequelize,
        name: {
            singular: "DisabledChatSound",
            plural: "DisabledChatsSound",
        },
        modelName: "DisabledChatSound",
        tableName: "Disabled_Chats_Sound",
        indexes: [
            { fields: ["user_id"], name: "IDX_Disabled_Chats_Sound_UserId" },
            { fields: ["chat_id"], name: "IDX_Disabled_Chats_Sound_ChatId" },
        ],
    });
    return DisabledChatSound;
};
//# sourceMappingURL=disabled-chat-sound.js.map