import type { ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { Chat } from "@core/database/models/chat";
import { User } from "@core/database/models/user";

export type CreationAttributes = InferCreationAttributes<DisabledChatSound>;

export class DisabledChatSound extends Model<InferAttributes<DisabledChatSound>, CreationAttributes> {
	declare userId: ForeignKey<User["id"]>;
	declare chatId: ForeignKey<Chat["id"]>;
};

export default (sequelize: Sequelize) => {
	DisabledChatSound.init(
		{
			userId: {
				type: DataTypes.UUID,
				primaryKey: true,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
				field: "user_id",
			},
			chatId: {
				type: DataTypes.UUID,
				primaryKey: true,
				references: {
					model: "Chats",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
				field: "chat_id",
			},
		},
		{
			sequelize,
			name: {
				singular: "DisabledChatSound",
				plural: "DisabledChatsSound",
			},
			modelName: "DisabledChatSound",
			tableName: "Disabled_Chats_Sound",
			indexes: [
				{ fields: [ "user_id" ], name: "IDX_Disabled_Chats_Sound_UserId" },
				{ fields: [ "chat_id" ], name: "IDX_Disabled_Chats_Sound_ChatId" },
			],
		},
	);

	return DisabledChatSound;
};
