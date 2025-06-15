import { IsEnum } from "class-validator";
import { NOTIFICATION_TYPE } from "src/types/enums";
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from "typeorm";

// Модель отправленного уведомления для хранения в базе данных
@Entity({ name: "Sent_Notifications" })
export default class SentNotificationsDto {
	@PrimaryGeneratedColumn({ name: "id" })
	id: number;

	@Column({ name: "recipient_id", type: "uniqueidentifier" })
	recipientId: string;

	@IsEnum(NOTIFICATION_TYPE)
	@Column({ name: "type", type: "varchar", length: 255 })
	type: NOTIFICATION_TYPE;

	@Column({ name: "payload", type: "nvarchar", length: 255, nullable: true })
	payload: string;

	@Column({ name: "action", type: "nvarchar", length: 255 })
	action: string;

	@Column({ name: "success", type: "bit", default: () => "0" })
	success: boolean;

	@Column({
		name: "error_message",
		type: "nvarchar",
		length: 255,
		nullable: true,
	})
	errorMessage?: string;

	@CreateDateColumn({
		name: "created_at",
		type: "datetime2",
		default: () => "GETDATE()",
	})
	createdAt: Date;
}
