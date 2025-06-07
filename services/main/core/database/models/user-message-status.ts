import type { ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { Message } from "@core/database/models/message";
import { User } from "@core/database/models/user";
import { type IUserMessageStatus } from "@custom-types/models.types";

export type CreationAttributes = InferCreationAttributes<UserMessageStatus>;

export class UserMessageStatus extends Model<InferAttributes<UserMessageStatus>, CreationAttributes> {
	declare messageId: ForeignKey<Message["id"]>;
	declare userId: ForeignKey<User["id"]>;
	declare isRead: number;
	declare isDeleted: number;

	getEntity(): IUserMessageStatus {
		return {
			messageId: this.messageId,
			userId: this.userId,
			isRead: this.isRead,
			isDeleted: this.isDeleted,
		};
	}
};

export default (sequelize: Sequelize) => {
	UserMessageStatus.init(
		{
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
			userId: {
				type: DataTypes.UUID,
				primaryKey: true,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "NO ACTION",
				onUpdate: "CASCADE",
				field: "user_id",
			},
			isRead: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				field: "is_read",
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				field: "is_deleted",
			},
		},
		{
			sequelize,
			name: {
				singular: "UserMessageStatus",
				plural: "UserMessageStatuses",
			},
			modelName: "UserMessageStatus",
			tableName: "User_Message_Statuses",
			indexes: [
				{ fields: [ "message_id" ], name: "IDX_User_Message_Statuses_MessageId" },
				{ fields: [ "user_id" ], name: "IDX_User_Message_Statuses_UserId" },
			],
		},
	);

	return UserMessageStatus;
};
