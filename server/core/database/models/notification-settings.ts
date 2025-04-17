import type { ForeignKey, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";

import { User } from "@core/database/models/user";
import { type INotificationSettings } from "@custom-types/models.types";

export class NotificationSettings extends Model<InferAttributes<NotificationSettings>, InferCreationAttributes<NotificationSettings>> {
	declare userId: ForeignKey<User["id"]>;
	declare soundEnabled: number;
	declare messageSound: number;
	declare friendRequestSound: number;

	getEntity(): INotificationSettings {
		return {
			userId: this.userId,
			soundEnabled: this.soundEnabled,
			messageSound: this.messageSound,
			friendRequestSound: this.friendRequestSound,
		};
	}
};

export default (sequelize: Sequelize) => {
	NotificationSettings.init(
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
			soundEnabled: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
				allowNull: false,
				field: "sound_enabled",
			},
			messageSound: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
				allowNull: false,
				field: "message_sound",
			},
			friendRequestSound: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
				allowNull: false,
				field: "friend_request_sound",
			},
		},
		{
			sequelize,
			name: {
				singular: "NotificationSettings",
				plural: "NotificationsSettings",
			},
			modelName: "NotificationSettings",
			tableName: "Notifications_Settings",
			indexes: [ { fields: [ "user_id" ], name: "IDX_Notifications_Settings_UserId" } ],
		},
	);

	return NotificationSettings;
};
