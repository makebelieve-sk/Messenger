"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const sequelize_1 = require("sequelize");
class Chat extends sequelize_1.Model {
    getEntity() {
        return {
            id: this.id,
            avatarId: this.avatarId,
            name: this.name,
        };
    }
}
exports.Chat = Chat;
;
exports.default = (sequelize) => {
    Chat.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        avatarId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            references: {
                model: "Photos",
                key: "id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
            field: "avatar_id",
        },
        name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        sequelize,
        name: {
            singular: "Chat",
            plural: "Chats",
        },
        modelName: "Chat",
        tableName: "Chats",
        indexes: [{ fields: ["name"], name: "IDX_Chats_Name" }],
    });
    return Chat;
};
//# sourceMappingURL=chat.js.map