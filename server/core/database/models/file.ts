import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { User } from "@core/database/models/user";
import { type IFile } from "@custom-types/models.types";

export type CreationAttributes = InferCreationAttributes<File, { omit: "id" | "createdAt" }>;

export class File extends Model<InferAttributes<File>, CreationAttributes> {
	declare id: CreationOptional<string>;
	declare userId: ForeignKey<User["id"]>;
	declare name: string;
	declare path: string;
	declare size: number;
	declare extension: string;
	declare createdAt: CreationOptional<string>;

	getEntity(): IFile {
		return {
			id: this.id,
			userId: this.userId,
			name: this.name,
			path: this.path,
			size: this.size,
			extension: this.extension,
			createdAt: this.createdAt,
		};
	}
};

export default (sequelize: Sequelize) => {
	File.init(
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
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
			name: {
				type: DataTypes.STRING(255),
				allowNull: false,
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
				singular: "File",
				plural: "Files",
			},
			modelName: "File",
			tableName: "Files",
			indexes: [ { fields: [ "userId" ], name: "IDX_Files_UserId" } ],
		},
	);

	return File;
};
