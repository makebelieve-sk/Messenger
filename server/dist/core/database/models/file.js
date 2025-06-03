"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const sequelize_1 = require("sequelize");
class File extends sequelize_1.Model {
    getEntity() {
        return {
            id: this.id,
            userId: this.userId,
            name: this.name,
            path: this.path,
            size: this.size,
            extension: this.extension,
            createdAt: this.createdAt,
        };
    }
}
exports.File = File;
;
exports.default = (sequelize) => {
    File.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
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
        name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        path: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        size: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false,
            validate: { min: 1 },
        },
        extension: {
            type: sequelize_1.DataTypes.STRING(50),
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
            singular: "File",
            plural: "Files",
        },
        modelName: "File",
        tableName: "Files",
        indexes: [{ fields: ["userId"], name: "IDX_Files_UserId" }],
    });
    return File;
};
//# sourceMappingURL=file.js.map