"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPhoto = void 0;
const sequelize_1 = require("sequelize");
class UserPhoto extends sequelize_1.Model {
}
exports.UserPhoto = UserPhoto;
;
exports.default = (sequelize) => {
    UserPhoto.init({
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
        photoId: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            references: {
                model: "Photos",
                key: "id",
            },
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION",
            field: "photo_id",
        },
    }, {
        sequelize,
        name: {
            singular: "UserPhoto",
            plural: "UsersPhoto",
        },
        modelName: "UserPhoto",
        tableName: "User_Photos",
        indexes: [
            { fields: ["photo_id"], name: "IDX_User_Photos_PhotoId" },
            { fields: ["user_id"], name: "IDX_User_Photos_UserId" },
        ],
    });
    return UserPhoto;
};
//# sourceMappingURL=user-photo.js.map