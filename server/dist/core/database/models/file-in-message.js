"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileInMessage = void 0;
const sequelize_1 = require("sequelize");
class FileInMessage extends sequelize_1.Model {
}
exports.FileInMessage = FileInMessage;
;
exports.default = (sequelize) => {
    FileInMessage.init({
        fileId: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            references: {
                model: "Files",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            field: "file_id",
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
            singular: "FileInMessage",
            plural: "FilesInMessage",
        },
        modelName: "FileInMessage",
        tableName: "Files_in_Message",
        indexes: [
            { fields: ["file_id"], name: "IDX_Files_in_Message_FileId" },
            { fields: ["message_id"], name: "IDX_Files_in_Message_MessageId" },
        ],
    });
    return FileInMessage;
};
//# sourceMappingURL=file-in-message.js.map