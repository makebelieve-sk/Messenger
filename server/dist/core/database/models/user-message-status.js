"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMessageStatus = void 0;
const sequelize_1 = require("sequelize");
class UserMessageStatus extends sequelize_1.Model {
    getEntity() {
        return {
            messageId: this.messageId,
            userId: this.userId,
            isRead: this.isRead,
            isDeleted: this.isDeleted,
        };
    }
}
exports.UserMessageStatus = UserMessageStatus;
;
exports.default = (sequelize) => {
    UserMessageStatus.init({
        messageId: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            references: {
                model: "Messages",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            field: "message_id",
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "NO ACTION",
            onUpdate: "CASCADE",
            field: "user_id",
        },
        isRead: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            field: "is_read",
        },
        isDeleted: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            field: "is_deleted",
        },
    }, {
        sequelize,
        name: {
            singular: "UserMessageStatus",
            plural: "UserMessageStatuses",
        },
        modelName: "UserMessageStatus",
        tableName: "User_Message_Statuses",
        indexes: [
            { fields: ["message_id"], name: "IDX_User_Message_Statuses_MessageId" },
            { fields: ["user_id"], name: "IDX_User_Message_Statuses_UserId" },
        ],
    });
    return UserMessageStatus;
};
//# sourceMappingURL=user-message-status.js.map