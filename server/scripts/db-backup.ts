// eslint-disable-next-line simple-import-sort/imports
import "@service/env";

import { createReadStream, createWriteStream } from "fs";
import { join } from "path";
import { Sequelize } from "sequelize";

import mssqlConfig from "@config/mssql.config";
import { prepareDumpFolder } from "@utils/dump-storage";
import { BACKUP_ENCYPTED_FILE } from "@utils/constants";
import { unlink } from "fs/promises";
import { pipeline } from "stream/promises";
import { createEncryptStream } from "@utils/crypto-dump";
import { constants, createGzip } from "zlib";

/**
 * Скрипт, использующийся для создания резервной копии базы данных.
 * Его можно использовать как на проде, так и в режиме разработки.
 * В файле package.json есть специальные команды:
 * - npm run backup
 * - npm run backup:prod
 * Очень важный момент: BACKUP DATABASE не требует монопольного доступа к базе.
 * Так что можем запускать скрипт, не отключая сервер.
 * Также, данный скрипт запускается по расписанию каждый месяц, так что нет нужны запускать его вручную.
 * Но я все же оставил такую возможность.
 */

const BACKUP_FILE = "backup.bak";

const main = async () => {
	try {
		// eslint-disable-next-line no-console
		console.log("Starting db-backup script");

		// Создаем папку для резервной копии (или перезаписываем более старую)
		const dumpPath = prepareDumpFolder();
		const backupFile = join(dumpPath, BACKUP_FILE);

		const sequelize = new Sequelize(mssqlConfig);

		// Создание резервной копии
		await sequelize.query(`
            BACKUP DATABASE MESSANGER TO DISK='${backupFile}' 
            WITH COMPRESSION;
        `);

		// eslint-disable-next-line no-console
		console.log("Backup completed successfully!");

		// Проверка целостности только что созданной резервной копии
		await sequelize.query(`
            RESTORE VERIFYONLY 
            FROM DISK='${backupFile}'
            WITH LOADHISTORY;
        `);

		// eslint-disable-next-line no-console
		console.log("Restore backup file is valid");

		/**
         * Используем потоки для чтения и записи (поток Transform для расшифровки и распаковки).
         * Потоки позволяют не читать весь файл в память, а читать по частям.
         * Работа с файлами любого размера. Параллельная обработка. Минимальное использование памяти.
         */
		await pipeline(
			// Читаем резервную копию
			createReadStream(backupFile),
			// Сжимаем резервную копию
			createGzip({ level: constants.Z_BEST_COMPRESSION }),
			// Шифруем сжатую резервную копию
			await createEncryptStream(dumpPath),
			// Сохраняем зашифрованную резервную копию
			createWriteStream(join(dumpPath, BACKUP_ENCYPTED_FILE)),
		);

		// eslint-disable-next-line no-console
		console.log("File encryption has been successfully completed!");

		// Удаление временного файла
		await unlink(backupFile);
        
		// eslint-disable-next-line no-console
		console.log("Temporary backup file removed");

		// Успешно завершаем выполнение процесса
		process.exit(0);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Backup failed:", error);
		process.exit(1);
	}
};

main();