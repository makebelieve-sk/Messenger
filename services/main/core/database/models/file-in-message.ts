import type { ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model  } from "sequelize";

import { File } from "@core/database/models/file";
import { Message } from "@core/database/models/message";

export type CreationAttributes = InferCreationAttributes<FileInMessage>;

export class FileInMessage extends Model<InferAttributes<FileInMessage>, CreationAttributes> {
	declare fileId: ForeignKey<File["id"]>;
	declare messageId: ForeignKey<Message["id"]>;
};

export default (sequelize: Sequelize) => {
	FileInMessage.init(
		{
			fileId: {
				type: DataTypes.UUID,
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
				type: DataTypes.UUID,
				primaryKey: true,
				references: {
					model: "Messages",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
				field: "message_id",
			},
		},
		{
			sequelize,
			name: {
				singular: "FileInMessage",
				plural: "FilesInMessage",
			},
			modelName: "FileInMessage",
			tableName: "Files_in_Message",
			indexes: [
				{ fields: [ "file_id" ], name: "IDX_Files_in_Message_FileId" },
				{ fields: [ "message_id" ], name: "IDX_Files_in_Message_MessageId" },
			],
		},
	);

	return FileInMessage;
};
