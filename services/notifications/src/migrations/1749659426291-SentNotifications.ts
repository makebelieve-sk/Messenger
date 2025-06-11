import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class SentNotifications1749659426291 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'Sent_Notifications',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'recipient_id',
                        type: 'uniqueidentifier',
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'payload',
                        type: 'nvarchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'action',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'success',
                        type: 'bit',
                        default: '0',
                    },
                    {
                        name: 'error_message',
                        type: 'nvarchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                ],
                foreignKeys: [
                    new TableForeignKey({
                        columnNames: ['recipient_id'],
                        referencedTableName: 'Users',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                        onUpdate: 'NO ACTION',
                    }),
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('sent_notifications', true);
    }
}