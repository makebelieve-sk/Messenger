import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Модель пользователя с данными из Телеграм для хранения в базе данных
@Entity({ name: "Telegram_Users" })
export default class TelegramUsersDto {
	@PrimaryGeneratedColumn({ name: "id" })
	id: number;

	@Column({ name: "first_name", nullable: true, length: 255 })
	firstName: string;

	@Column({ name: "last_name", nullable: true, length: 255 })
	lastName: string;

	@Column({ name: "user_name", length: 255 })
	userName: string;

	@Column({ name: "telegram_id", unique: true })
	telegramId: number;

	@Column({ name: "user_id", type: "uniqueidentifier" })
	userId: string;
}
