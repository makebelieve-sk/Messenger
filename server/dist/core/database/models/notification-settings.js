"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSettings = void 0;
const sequelize_1 = require("sequelize");
class NotificationSettings extends sequelize_1.Model {
    getEntity() {
        return {
            userId: this.userId,
            soundEnabled: this.soundEnabled,
            messageSound: this.messageSound,
            friendRequestSound: this.friendRequestSound,
        };
    }
}
exports.NotificationSettings = NotificationSettings;
;
exports.default = (sequelize) => {
    NotificationSettings.init({
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
        soundEnabled: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            field: "sound_enabled",
        },
        messageSound: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            field: "message_sound",
        },
        friendRequestSound: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            field: "friend_request_sound",
        },
    }, {
        sequelize,
        name: {
            singular: "NotificationSettings",
            plural: "NotificationsSettings",
        },
        modelName: "NotificationSettings",
        tableName: "Notifications_Settings",
        indexes: [{ fields: ["user_id"], name: "IDX_Notifications_Settings_UserId" }],
    });
    return NotificationSettings;
};
//# sourceMappingURL=notification-settings.js.map