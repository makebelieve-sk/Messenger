import type { ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { Chat } from "@core/database/models/chat";
import { User } from "@core/database/models/user";

export type CreationAttributes = InferCreationAttributes<UserInChat>;

export class UserInChat extends Model<InferAttributes<UserInChat>, CreationAttributes> {
	declare chatId: ForeignKey<Chat["id"]>;
	declare userId: ForeignKey<User["id"]>;
};

export default (sequelize: Sequelize) => {
	UserInChat.init(
		{
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
		},
		{
			sequelize,
			name: {
				singular: "UserInChat",
				plural: "UsersInChat",
			},
			modelName: "UserInChat",
			tableName: "Users_in_Chat",
			indexes: [
				{ fields: [ "chat_id" ], name: "IDX_Users_in_Chat_ChatId" },
				{ fields: [ "user_id" ], name: "IDX_Users_in_Chat_UserId" },
			],
		},
	);

	return UserInChat;
};
