import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { Chat } from "@core/database/models/chat";
import { User } from "@core/database/models/user";
import { type IMessage } from "@custom-types/models.types";

export type CreationAttributes = InferCreationAttributes<Message, { omit: "id" | "createdAt" }>;

export class Message extends Model<InferAttributes<Message>, CreationAttributes> {
	declare id: CreationOptional<string>;
	declare chatId: ForeignKey<Chat["id"]>;
	declare userId: ForeignKey<User["id"]>;
	declare type: number;
	declare message: string;
	declare createdAt: CreationOptional<string>;

	getEntity(): IMessage {
		return {
			id: this.id,
			chatId: this.chatId,
			userId: this.userId,
			type: this.type,
			message: this.message,
			createdAt: this.createdAt,
		};
	}
};

export default (sequelize: Sequelize) => {
	Message.init(
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			chatId: {
				type: DataTypes.UUID,
				allowNull: false,
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
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "NO ACTION",
				onUpdate: "CASCADE",
				field: "user_id",
			},
			type: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			message: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			createdAt: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				field: "created_at",
			},
		},
		{
			sequelize,
			name: {
				singular: "Message",
				plural: "Messages",
			},
			modelName: "Message",
			tableName: "Messages",
			indexes: [
				{ fields: [ "chat_id" ], name: "IDX_Messages_ChatId" },
				{ fields: [ "user_id" ], name: "IDX_Messages_UserId" },
			],
		},
	);

	return Message;
};
