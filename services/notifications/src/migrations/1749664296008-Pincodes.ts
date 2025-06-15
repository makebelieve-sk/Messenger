import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Pincodes1749664296008 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "Pincodes",
				columns: [
					{
						name: "id",
						type: "int",
						isPrimary: true,
						isGenerated: true,
						generationStrategy: "increment",
					},
					{
						name: "user_id",
						type: "uniqueidentifier",
						isNullable: false,
					},
					{
						name: "pincode",
						type: "varchar",
						length: "255",
						isUnique: true,
						isNullable: false,
					},
					{
						name: "expires_at",
						type: "datetime2",
						isNullable: false,
					},
					{
						name: "created_at",
						type: "datetime2",
						default: "GETDATE()",
					},
					{
						name: "attempts",
						type: "int",
						default: "0",
					},
				],
				foreignKeys: [
					{
						columnNames: ["user_id"],
						referencedTableName: "Users",
						referencedColumnNames: ["id"],
						onDelete: "CASCADE",
						onUpdate: "NO ACTION",
					},
				],
			}),
			true,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("Pincodes", true);
	}
}
