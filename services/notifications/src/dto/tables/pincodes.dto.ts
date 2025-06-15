import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from "typeorm";

// Модель создания пин-кода для хранения в базе данных
@Entity({ name: "Pincodes" })
export default class PincodesDto {
	@PrimaryGeneratedColumn({ name: "id" })
	id: number;

	@Column({ name: "user_id", type: "uniqueidentifier" })
	userId: string;

	@Column({ type: "int", unique: true })
	pincode: number;

	@Column({ name: "expires_at", type: "datetime2" })
	expiresAt: Date;

	@CreateDateColumn({ name: "created_at", type: "datetime2" })
	createdAt: Date;

	@Column({ type: "int", default: 0 })
	attempts: number;
}
