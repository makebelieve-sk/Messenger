import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

// Модель пользователя для хранения в базе данных
@Entity({ name: "Users" })
@Index("UQ_Users_Active_Email", ["email"], {
	unique: true,
	where: "is_deleted = false",
})
@Index("UQ_Users_Active_Phone", ["phone"], {
	unique: true,
	where: "is_deleted = false",
})
export default class UsersDto {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "first_name", type: "varchar", length: 100 })
	firstName: string;

	@Column({ name: "second_name", type: "varchar", length: 100, nullable: true })
	secondName: string | null;

	@Column({ name: "third_name", type: "varchar", length: 100 })
	thirdName: string;

	@Column({ type: "varchar", length: 255, unique: false })
	email: string;

	@Column({ type: "varchar", length: 20, unique: false })
	phone: string;

	@Column({ type: "varchar", length: 1024 })
	password: string;

	@Column({ type: "varchar", length: 1024 })
	salt: string;

	@Column({ name: "avatar_id", type: "uuid", nullable: true })
	avatarId: string | null;

	@Column({ name: "is_deleted", type: "bit", default: () => "0" })
	isDeleted: boolean;
}
