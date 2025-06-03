"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDetail = void 0;
const sequelize_1 = require("sequelize");
class UserDetail extends sequelize_1.Model {
    getEntity() {
        return {
            userId: this.userId,
            birthday: this.birthday,
            city: this.city,
            work: this.work,
            sex: this.sex,
            lastSeen: this.lastSeen,
        };
    }
}
exports.UserDetail = UserDetail;
;
exports.default = (sequelize) => {
    UserDetail.init({
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
        birthday: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
        },
        city: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
        },
        work: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
        },
        sex: {
            type: sequelize_1.DataTypes.ENUM("male", "female"),
            allowNull: true,
        },
        lastSeen: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: "last_seen",
        },
    }, {
        sequelize,
        name: {
            singular: "UserDetail",
            plural: "UserDetails",
        },
        modelName: "UserDetail",
        tableName: "User_Details",
        indexes: [{ fields: ["user_id"], name: "IDX_User_Details_UserId" }],
    });
    return UserDetail;
};
//# sourceMappingURL=user-detail.js.map