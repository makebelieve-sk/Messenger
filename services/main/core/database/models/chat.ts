import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model  } from "sequelize";

import { Photo } from "@core/database/models/photo";
import { type IChat } from "@custom-types/models.types";

export type CreationAttributes = Partial<InferCreationAttributes<Chat, { omit: "id" }>>;

export class Chat extends Model<InferAttributes<Chat>, CreationAttributes> {
	declare id: CreationOptional<string>;
	declare avatarId: ForeignKey<Photo["id"]> | null;
	declare name: string | null;

	getEntity(): IChat {
		return {
			id: this.id,
			avatarId: this.avatarId,
			name: this.name,
		};
	}
};

export default (sequelize: Sequelize) => {
	Chat.init(
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			avatarId: {
				type: DataTypes.UUID,
				allowNull: true,
				references: {
					model: "Photos",
					key: "id",
				},
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
				field: "avatar_id",
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
		},
		{
			sequelize,
			name: {
				singular: "Chat",
				plural: "Chats",
			},
			modelName: "Chat",
			tableName: "Chats",
			indexes: [ { fields: [ "name" ], name: "IDX_Chats_Name" } ],
		},
	);

	return Chat;
};
