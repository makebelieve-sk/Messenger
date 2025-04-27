import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { User } from "@core/database/models/user";
import { type IPhoto } from "@custom-types/models.types";

export type CreationAttributes = InferCreationAttributes<Photo, { omit: "id" | "createdAt" }>;

export class Photo extends Model<InferAttributes<Photo>, CreationAttributes> {
	declare id: CreationOptional<string>;
	declare userId: ForeignKey<User["id"]>;
	declare path: string;
	declare size: number;
	declare extension: string;
	declare createdAt: CreationOptional<string>;

	getEntity(): IPhoto {
		return {
			id: this.id,
			userId: this.userId,
			path: this.path,
			size: this.size,
			extension: this.extension,
			createdAt: this.createdAt,
		};
	}
};

export default (sequelize: Sequelize) => {
	Photo.init(
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			userId: {
				type: DataTypes.UUID,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "NO ACTION",
				onUpdate: "NO ACTION",
				allowNull: false,
				field: "user_id",
			},
			path: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			size: {
				type: DataTypes.BIGINT,
				allowNull: false,
				validate: { min: 1 },
			},
			extension: {
				type: DataTypes.STRING(50),
				allowNull: false,
				validate: {
					isIn: [ [ "jpg", "jpeg", "png", "gif", "bmp", "webp" ] ],
				},
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
				singular: "Photo",
				plural: "Photos",
			},
			modelName: "Photo",
			tableName: "Photos",
			indexes: [ { fields: [ "user_id" ], name: "IDX_Photos_UserId" } ],
		},
	);

	return Photo;
};
