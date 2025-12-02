import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { User } from "@core/database/models/user";
import { type IPhoto } from "@custom-types/models.types";

export type CreationAttributes = InferCreationAttributes<Photo, { omit: "id" | "createdAt" }>;

export class Photo extends Model<InferAttributes<Photo>, CreationAttributes> {
	declare id: CreationOptional<string>;
	declare userId: ForeignKey<User["id"]>;
	declare path: string;
	declare size: number | null;
	declare extension: string | null;
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
				allowNull: true,
				validate: { 
					min: 1, // Валидация применяется только если значение не null
				},
			},
			extension: {
				type: DataTypes.STRING(50),
				allowNull: true,
				validate: {
					isIn: [ [ "jpg", "jpeg", "png", "gif", "bmp", "webp" ] ], // Валидация применяется только если значение не null
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
			hooks: {
				/**
				 * Используем хук, который вызывается только для текущей модели и применяется ко всем экземплярам.
				 * Так как используем bulkCreate, то добавляем не большой смещение в 1 микросекунду,
				 * чтобы записи можно было брать правильно в порядке создания.
				 */
				beforeBulkCreate(instances) {
					const now = Date.now();
					instances.forEach((inst, idx) => {
						inst.setDataValue("createdAt", new Date(now + idx) as unknown as string);
					});
				},
			},
		},
	);

	return Photo;
};
