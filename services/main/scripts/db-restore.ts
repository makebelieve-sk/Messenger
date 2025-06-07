// eslint-disable-next-line simple-import-sort/imports
import "@service/env";

import { createReadStream, createWriteStream } from "fs";
import { join } from "path";
import { Sequelize } from "sequelize";
import { createGunzip } from "zlib";

import mssqlConfig from "@config/mssql.config";
import { createDecryptStream } from "@utils/crypto-dump";
import { getAllSortedByTimestampFolders } from "@utils/files";
import { BACKUP_ENCYPTED_FILE } from "@utils/constants";
import { pipeline } from "stream/promises";
import { unlink } from "fs/promises";

/**
 * Скрипт, использующийся для восстановления базы данных из резервной копии.
 * Его можно использовать как на проде, так и в режиме разработки.
 * В файле package.json есть специальные команды:
 * - npm run restore -- dump_1745176179916 (если не указан, используется поседняя папка)
 * - npm run restore:prod -- dump_1745176179916 (если не указан, используется поседняя папка)
 * Очень важный момент: RESTORE DATABASE требует монопольного доступа к базе. Даже sleeping-сессии блокируют операцию.
 * Поэтому отключаем сервер перед восстановлением и включаем после.
 * Если запуск локальный - отключаем еще и Microsoft SQL Server Management Studio.
 */

const DUMPS_DIR = join(__dirname, "../dumps");
const RESTORE_FILE = "restore.bak";

async function main() {
	try {
		// Получаем последнюю папку с резервной копией
		const folders = getAllSortedByTimestampFolders(DUMPS_DIR);
		// Получаем имя папки с резервной копией из аргумента командной строки
		const dumpNameFromArgv = process.argv[2];

		const latestDump = dumpNameFromArgv
			? folders.find(dumpName => dumpName === dumpNameFromArgv)
			: folders[folders.length - 1];

		if (!latestDump) {
			throw new Error(`No backups found.${dumpNameFromArgv 
				? ` Please, pass the correct dump name to the argument instead of "${dumpNameFromArgv}".`
				: ""
			}`);
		}

		// Получаем путь к папке с резервной копией
		const dumpPath = join(DUMPS_DIR, latestDump);
		// Получаем путь к файлу с резервной копией
		const backupPath = join(dumpPath, RESTORE_FILE);

		/**
         * Используем потоки для чтения и записи (поток Transform для расшифровки и распаковки).
         * Потоки позволяют не читать весь файл в память, а читать по частям.
         * Работа с файлами любого размера. Параллельная обработка. Минимальное использование памяти.
         */
		await pipeline(
			// Ищем зашифрованный файл с резервной копией внутри найденной последней/указанной папки
			createReadStream(join(dumpPath, BACKUP_ENCYPTED_FILE)),
			// Расшифровываем резервную копию
			await createDecryptStream(dumpPath),
			// Распаковываем резервную копию
			createGunzip(),
			// Сохраняем распакованную резервную копию в новый файл
			createWriteStream(backupPath),
		);

		const sequelize = new Sequelize(mssqlConfig);

		// Проверяем целостность резервной копии
		await sequelize.query(`
            RESTORE VERIFYONLY 
            FROM DISK='${backupPath}'
            WITH LOADHISTORY;
        `);

		// eslint-disable-next-line no-console
		console.log("Restore backup file is valid");

		// Восстанавливаем резервную копию, блокируя базу данных и Node.js процесс
		await sequelize.query(`
            USE master;
            RESTORE DATABASE MESSANGER 
            FROM DISK='${backupPath}' 
            WITH REPLACE, RECOVERY;
        `);

		// eslint-disable-next-line no-console
		console.log("Restore completed successfully!");

		// Удаляем временный файл
		await unlink(backupPath);

		// eslint-disable-next-line no-console
		console.log("Temporary file removed successfully");

		// Успешно завершаем выполнение процесса
		process.exit(0);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Restore failed:", error);
		process.exit(1);
	}
}

main();