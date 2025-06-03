"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    getEntity() {
        return {
            id: this.id,
            firstName: this.firstName,
            secondName: this.secondName,
            thirdName: this.thirdName,
            email: this.email,
            phone: this.phone,
            avatarUrl: this.avatarUrl,
            avatarCreateDate: this.avatarCreateDate,
            isDeleted: this.isDeleted,
        };
    }
}
exports.User = User;
;
exports.default = (sequelize) => {
    User.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true, // primaryKey по умолчанию не разрешает NULL, так что у полей с primaryKey нет смысла писать allowNull: false
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            field: "first_name",
        },
        secondName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: "second_name",
        },
        thirdName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            field: "third_name",
        },
        email: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            validate: { isEmail: true },
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            validate: { is: /^\+\d{11,15}$/ },
        },
        password: {
            type: sequelize_1.DataTypes.STRING(1024),
            allowNull: false,
        },
        salt: {
            type: sequelize_1.DataTypes.STRING(1024),
            allowNull: false,
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
        isDeleted: {
            type: sequelize_1.DataTypes.BOOLEAN, // Такой тип автоматически маппится в BIT (0/1)
            allowNull: false,
            defaultValue: false,
            field: "is_deleted",
        },
    }, {
        sequelize,
        name: {
            singular: "User",
            plural: "Users",
        },
        modelName: "User",
        tableName: "Users",
        indexes: [
            { fields: ["email"], unique: true, name: "UQ_Users_Active_Email", where: { is_deleted: false } },
            { fields: ["phone"], unique: true, name: "UQ_Users_Active_Phone", where: { is_deleted: false } },
        ],
    });
    return User;
};
//# sourceMappingURL=user.js.map