import type { ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { Photo } from "@core/database/models/photo";
import { User } from "@core/database/models/user";

export type CreationAttributes = Partial<InferCreationAttributes<UserPhoto, { omit: "Photos" }>>;

export class UserPhoto extends Model<InferAttributes<UserPhoto, { omit: "Photos" }>, CreationAttributes> {
	declare userId: ForeignKey<User["id"]>;
	declare photoId: ForeignKey<Photo["id"]>;

	/**
	 * Типы других сущностей, которые могут быть использованы в допонении к запросу через include.
	 * То есть это те поля, которые не существуют в модели, а либо добавляются через include, либо кастомные.
	 */
	declare Photos: NonAttribute<Photo[]>;
};

export default (sequelize: Sequelize) => {
	UserPhoto.init(
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
			photoId: {
				type: DataTypes.UUID,
				primaryKey: true,
				references: {
					model: "Photos",
					key: "id",
				},
				onDelete: "NO ACTION",
				onUpdate: "NO ACTION",
				field: "photo_id",
			},
		},
		{
			sequelize,
			name: {
				singular: "UserPhoto",
				plural: "UsersPhoto",
			},
			modelName: "UserPhoto",
			tableName: "User_Photos",
			indexes: [
				{ fields: [ "photo_id" ], name: "IDX_User_Photos_PhotoId" },
				{ fields: [ "user_id" ], name: "IDX_User_Photos_UserId" },
			],
		},
	);

	return UserPhoto;
};
