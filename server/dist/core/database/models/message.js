"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const sequelize_1 = require("sequelize");
class Message extends sequelize_1.Model {
    getEntity() {
        return {
            id: this.id,
            chatId: this.chatId,
            userId: this.userId,
            type: this.type,
            message: this.message,
            createdAt: this.createdAt,
        };
    }
}
exports.Message = Message;
;
exports.default = (sequelize) => {
    Message.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        chatId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
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
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "NO ACTION",
            onUpdate: "CASCADE",
            field: "user_id",
        },
        type: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: "created_at",
        },
    }, {
        sequelize,
        name: {
            singular: "Message",
            plural: "Messages",
        },
        modelName: "Message",
        tableName: "Messages",
        indexes: [
            { fields: ["chat_id"], name: "IDX_Messages_ChatId" },
            { fields: ["user_id"], name: "IDX_Messages_UserId" },
        ],
    });
    return Message;
};
//# sourceMappingURL=message.js.map