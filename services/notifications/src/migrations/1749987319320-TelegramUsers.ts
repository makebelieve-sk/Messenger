import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class TelegramUsers1749987319320 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "Telegram_Users",
				columns: [
					{
						name: "id",
						type: "int",
						isPrimary: true,
						isGenerated: true,
						generationStrategy: "increment",
					},
					{
						name: "first_name",
						type: "varchar",
						length: "255",
						isNullable: true,
					},
					{
						name: "last_name",
						type: "varchar",
						length: "255",
						isNullable: true,
					},
					{
						name: "user_name",
						type: "varchar",
						length: "255",
						isNullable: false,
					},
					{
						name: "telegram_id",
						type: "int",
						isUnique: true,
						isNullable: false,
					},
					{
						name: "user_id",
						type: "uniqueidentifier",
						isNullable: false,
					},
				],
				foreignKeys: [
					{
						columnNames: ["user_id"],
						referencedColumnNames: ["id"],
						referencedTableName: "Users",
						onDelete: "CASCADE",
						onUpdate: "NO ACTION",
					},
				],
			}),
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("Telegram_Users");
	}
}
