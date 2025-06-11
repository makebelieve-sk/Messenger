import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { User } from "@core/database/models/user";
import { type IUserDetail } from "@custom-types/models.types";

export type CreationAttributes = InferCreationAttributes<UserDetail, { omit: "birthday" | "city" | "work" | "sex" | "lastSeen" }>;

export class UserDetail extends Model<InferAttributes<UserDetail>, CreationAttributes> {
	declare userId: ForeignKey<User["id"]>;
	declare birthday: CreationOptional<string | null>;
	declare city: CreationOptional<string | null>;
	declare work: CreationOptional<string | null>;
	declare sex: CreationOptional<"male" | "female" | null>;
	declare lastSeen: CreationOptional<string | null>;

	getEntity(): IUserDetail {
		return {
			userId: this.userId,
			birthday: this.birthday,
			city: this.city,
			work: this.work,
			sex: this.sex,
			lastSeen: this.lastSeen,
		};
	}
};

export default (sequelize: Sequelize) => {
	UserDetail.init(
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
			birthday: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			city: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			work: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			sex: {
				type: DataTypes.ENUM("male", "female"),
				allowNull: true,
			},
			lastSeen: {
				type: DataTypes.DATE,
				allowNull: true,
				field: "last_seen",
			},
		},
		{
			sequelize,
			name: {
				singular: "UserDetail",
				plural: "UserDetails",
			},
			modelName: "UserDetail",
			tableName: "User_Details",
			indexes: [ { fields: [ "user_id" ], name: "IDX_User_Details_UserId" } ],
		},
	);

	return UserDetail;
};
