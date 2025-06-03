"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendAction = void 0;
const sequelize_1 = require("sequelize");
class FriendAction extends sequelize_1.Model {
    getEntity() {
        return {
            id: this.id,
            sourceUserId: this.sourceUserId,
            targetUserId: this.targetUserId,
            actionType: this.actionType,
            createdAt: this.createdAt,
        };
    }
}
exports.FriendAction = FriendAction;
;
exports.default = (sequelize) => {
    FriendAction.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        sourceUserId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            field: "source_user_id",
        },
        targetUserId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION",
            field: "target_user_id",
        },
        actionType: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: "action_type",
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: "created_at",
        },
    }, {
        sequelize,
        // Важно: Здесь поле name не указываем, так как прееопределяем его в ассоциации, указывая as
        modelName: "FriendAction",
        tableName: "Friend_Actions",
        indexes: [
            { fields: ["source_user_id"], name: "IDX_Friend_Actions_SourceUserId" },
            { fields: ["target_user_id"], name: "IDX_Friend_Actions_TargetUserId" },
        ],
    });
    return FriendAction;
};
//# sourceMappingURL=friend-action.js.map