"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Photo = void 0;
const sequelize_1 = require("sequelize");
class Photo extends sequelize_1.Model {
    getEntity() {
        return {
            id: this.id,
            userId: this.userId,
            path: this.path,
            size: this.size,
            extension: this.extension,
            createdAt: this.createdAt,
        };
    }
}
exports.Photo = Photo;
;
exports.default = (sequelize) => {
    Photo.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION",
            allowNull: false,
            field: "user_id",
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
            validate: {
                isIn: [["jpg", "jpeg", "png", "gif", "bmp", "webp"]],
            },
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: "created_at",
        },
    }, {
        sequelize,
        name: {
            singular: "Photo",
            plural: "Photos",
        },
        modelName: "Photo",
        tableName: "Photos",
        indexes: [{ fields: ["user_id"], name: "IDX_Photos_UserId" }],
        hooks: {
            /**
             * Используем хук, который вызывается только для текущей модели и применяется ко всем экземплярам.
             * Так как используем bulkCreate, то добавляем не большой смещение в 1 микросекунду,
             * чтобы записи можно было брать правильно в порядке создания.
             */
            beforeBulkCreate(instances) {
                const now = Date.now();
                instances.forEach((inst, idx) => {
                    inst.setDataValue("createdAt", new Date(now + idx));
                });
            },
        },
    });
    return Photo;
};
//# sourceMappingURL=photo.js.map