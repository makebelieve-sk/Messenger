import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { User } from "@core/database/models/user";
import { type IFriendActionLog } from "@custom-types/models.types";

export type CreationAttributes = InferCreationAttributes<FriendActionLog, { omit: "id" | "createdAt" }>;

export class FriendActionLog extends Model<InferAttributes<FriendActionLog>, CreationAttributes> {
	declare id: CreationOptional<string>;
	declare sourceUserId: ForeignKey<User["id"]>;
	declare targetUserId: ForeignKey<User["id"]>;
	declare actionType: number;
	declare createdAt: CreationOptional<string>;

	getEntity(): IFriendActionLog {
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
	FriendActionLog.init(
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
			modelName: "FriendActionLog",
			tableName: "Friend_Actions_Log",
			indexes: [
				{ fields: [ "source_user_id" ], name: "IDX_Friend_Actions_Log_SourceUserId" },
				{ fields: [ "target_user_id" ], name: "IDX_Friend_Actions_Log_TargetUserId" },
			],
		},
	);

	return FriendActionLog;
};
