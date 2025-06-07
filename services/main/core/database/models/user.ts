import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { type FriendAction } from "@core/database/models/friend-action";
import { Photo } from "@core/database/models/photo";
import { type ISafeUser } from "@custom-types/user.types";

export type CreationAttributes = InferCreationAttributes<User, { omit: "id" | "secondName" | "avatarId" | "avatarUrl" | "avatarCreateDate" | "isDeleted" }>

export class User extends Model<InferAttributes<User, { omit: "avatarUrl" | "avatarCreateDate" }>, CreationAttributes> {
	declare id: CreationOptional<string>;
	declare firstName: string;
	declare secondName: CreationOptional<string | null>;
	declare thirdName: string;
	declare email: string;
	declare phone: string;
	declare password: string;
	declare salt: string;
	declare avatarId: CreationOptional<ForeignKey<Photo["id"]> | null>;
	declare isDeleted: CreationOptional<boolean>;

	// Данных полей в модели нет, но они нужны для отрисовки аватара пользователя (а он используется вообще везде, где только можно) и времени его добавления
	declare avatarUrl: NonAttribute<string | null>;
	declare avatarCreateDate: NonAttribute<string | null>;

	declare UserWithAvatar: NonAttribute<{ path: string; createdAt: string; }>;
	declare SentFriendRequestsLog: NonAttribute<FriendAction[]>;
	declare ReceivedFriendRequestsLog: NonAttribute<FriendAction[]>;

	getEntity(): ISafeUser {
		return {
			id: this.id,
			firstName: this.firstName,
			secondName: this.secondName,
			thirdName: this.thirdName,
			email: this.email,
			phone: this.phone,
			avatarUrl: this.avatarUrl,
			avatarCreateDate: this.avatarCreateDate,
			isDeleted: this.isDeleted,
		};
	}
};

export default (sequelize: Sequelize) => {
	User.init(
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true, // primaryKey по умолчанию не разрешает NULL, так что у полей с primaryKey нет смысла писать allowNull: false
				defaultValue: DataTypes.UUIDV4,
			},
			firstName: {
				type: DataTypes.STRING(100),
				allowNull: false,
				field: "first_name",
			},
			secondName: {
				type: DataTypes.STRING(100),
				allowNull: true,
				field: "second_name",
			},
			thirdName: {
				type: DataTypes.STRING(100),
				allowNull: false,
				field: "third_name",
			},
			email: {
				type: DataTypes.STRING(255),
				allowNull: false,
				validate: { isEmail: true },
			},
			phone: {
				type: DataTypes.STRING(20),
				allowNull: false,
				validate: { is: /^\+\d{11,15}$/ },
			},
			password: {
				type: DataTypes.STRING(1024),
				allowNull: false,
			},
			salt: {
				type: DataTypes.STRING(1024),
				allowNull: false,
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
			isDeleted: {
				type: DataTypes.BOOLEAN, // Такой тип автоматически маппится в BIT (0/1)
				allowNull: false,
				defaultValue: false,
				field: "is_deleted",
			},
		},
		{
			sequelize,
			name: {
				singular: "User",
				plural: "Users",
			},
			modelName: "User",
			tableName: "Users",
			indexes: [
				{ fields: [ "email" ], unique: true, name: "UQ_Users_Active_Email", where: { is_deleted: false } },
				{ fields: [ "phone" ], unique: true, name: "UQ_Users_Active_Phone", where: { is_deleted: false } },
			],
		},
	);

	return User;
};
