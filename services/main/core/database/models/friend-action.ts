import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { type User } from "@core/database/models/user";
import { FriendActionType } from "@custom-types/enums";
import { type IFriendAction } from "@custom-types/models.types";

export type CreationAttributes = InferCreationAttributes<FriendAction, { omit: "id" | "createdAt" }>;

export class FriendAction extends Model<InferAttributes<FriendAction>, CreationAttributes> {
	declare id: CreationOptional<string>;
	declare sourceUserId: ForeignKey<User["id"]>;
	declare targetUserId: ForeignKey<User["id"]>;
	declare actionType: FriendActionType;
	declare createdAt: CreationOptional<string>;

	declare SourceUser: NonAttribute<User>;
	declare TargetUser: NonAttribute<User>;

	getEntity(): IFriendAction {
		return {
			id: this.id,
			sourceUserId: this.sourceUserId,
			targetUserId: this.targetUserId,
			actionType: this.actionType,
			createdAt: this.createdAt,
		};
	}
};

export default (sequelize: Sequelize) => {
	FriendAction.init(
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			sourceUserId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
				field: "source_user_id",
			},
			targetUserId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "NO ACTION",
				onUpdate: "NO ACTION",
				field: "target_user_id",
			},
			actionType: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: "action_type",
			},
			createdAt: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				field: "created_at",
			},
		},
		{
			sequelize,
			// Важно: Здесь поле name не указываем, так как прееопределяем его в ассоциации, указывая as
			modelName: "FriendAction",
			tableName: "Friend_Actions",
			indexes: [
				{ fields: [ "source_user_id" ], name: "IDX_Friend_Actions_SourceUserId" },
				{ fields: [ "target_user_id" ], name: "IDX_Friend_Actions_TargetUserId" },
			],
		},
	);

	return FriendAction;
};
