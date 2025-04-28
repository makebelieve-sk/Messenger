import type { ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { Message } from "@core/database/models/message";
import { Photo } from "@core/database/models/photo";

export type CreationAttributes = InferCreationAttributes<PhotoInMessage>;

export class PhotoInMessage extends Model<InferAttributes<PhotoInMessage>, CreationAttributes> {
	declare photoId: ForeignKey<Photo["id"]>;
	declare messageId: ForeignKey<Message["id"]>;
};

export default (sequelize: Sequelize) => {
	PhotoInMessage.init(
		{
			photoId: {
				type: DataTypes.UUID,
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
				singular: "PhotoInMessage",
				plural: "PhotosInMessage",
			},
			modelName: "PhotoInMessage",
			tableName: "Photos_in_Message",
			indexes: [
				{ fields: [ "photo_id" ], name: "IDX_Photos_in_Message_PhotoId" },
				{ fields: [ "message_id" ], name: "IDX_Photos_in_Message_MessageId" },
			],
		},
	);

	return PhotoInMessage;
};
