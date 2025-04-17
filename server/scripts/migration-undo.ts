import path from "path";
import { Sequelize } from "sequelize";

import mssqlConfig from "@config/mssql.config";

import "@service/env";

/**
 * Скрипт, использующийся для запуска откатов конкретных миграций.
 * Его можно использовать как на проде, так и в режиме разработки.
 * В файле package.json есть специальная команда:
 *   - npm run migrate-dev:undo -- 04.03.2025-init-schema.ts
 *   - npm run migrate-prod:undo -- 04.03.2025-init-schema.js
 */

const sequelize = new Sequelize(mssqlConfig);
const MIGRATION_DIR = "migrations";

// Функция скрипта, которая выполняет откат заданной миграции
async function undoMigration(migrationFileName: string) {
	try {
		const mirgationPath = path.join(__dirname, "../", MIGRATION_DIR, migrationFileName);
		const Migration = require(mirgationPath).default;
		await Migration.down(sequelize);
		// eslint-disable-next-line no-console
		console.log(`Migration ${migrationFileName} successfully rolled back.`);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`Error when rolling back migration ${migrationFileName}:`, error);
	} finally {
		await sequelize.close();
	}
}

// Получаем наименование миграции из командной строки
const migrationFileName = process.argv[2];

if (!migrationFileName) {
	// eslint-disable-next-line no-console
	console.error("Attention: Specify the migration name to roll back.");
	process.exit(1);
}

undoMigration(migrationFileName);
