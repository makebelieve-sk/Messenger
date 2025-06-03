"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoInMessage = void 0;
const sequelize_1 = require("sequelize");
class PhotoInMessage extends sequelize_1.Model {
}
exports.PhotoInMessage = PhotoInMessage;
;
exports.default = (sequelize) => {
    PhotoInMessage.init({
        photoId: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            references: {
                model: "Photos",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            field: "photo_id",
        },
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
    }, {
        sequelize,
        name: {
            singular: "PhotoInMessage",
            plural: "PhotosInMessage",
        },
        modelName: "PhotoInMessage",
        tableName: "Photos_in_Message",
        indexes: [
            { fields: ["photo_id"], name: "IDX_Photos_in_Message_PhotoId" },
            { fields: ["message_id"], name: "IDX_Photos_in_Message_MessageId" },
        ],
    });
    return PhotoInMessage;
};
//# sourceMappingURL=photo-in-message.js.map