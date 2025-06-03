"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line simple-import-sort/imports
require("@service/env");
const fs_1 = require("fs");
const path_1 = require("path");
const sequelize_1 = require("sequelize");
const mssql_config_1 = __importDefault(require("@config/mssql.config"));
const dump_storage_1 = require("@utils/dump-storage");
const constants_1 = require("@utils/constants");
const promises_1 = require("fs/promises");
const promises_2 = require("stream/promises");
const crypto_dump_1 = require("@utils/crypto-dump");
const zlib_1 = require("zlib");
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
        const dumpPath = (0, dump_storage_1.prepareDumpFolder)();
        const backupFile = (0, path_1.join)(dumpPath, BACKUP_FILE);
        const sequelize = new sequelize_1.Sequelize(mssql_config_1.default);
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
        await (0, promises_2.pipeline)(
        // Читаем резервную копию
        (0, fs_1.createReadStream)(backupFile), 
        // Сжимаем резервную копию
        (0, zlib_1.createGzip)({ level: zlib_1.constants.Z_BEST_COMPRESSION }), 
        // Шифруем сжатую резервную копию
        await (0, crypto_dump_1.createEncryptStream)(dumpPath), 
        // Сохраняем зашифрованную резервную копию
        (0, fs_1.createWriteStream)((0, path_1.join)(dumpPath, constants_1.BACKUP_ENCYPTED_FILE)));
        // eslint-disable-next-line no-console
        console.log("File encryption has been successfully completed!");
        // Удаление временного файла
        await (0, promises_1.unlink)(backupFile);
        // eslint-disable-next-line no-console
        console.log("Temporary backup file removed");
        // Успешно завершаем выполнение процесса
        process.exit(0);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Backup failed:", error);
        process.exit(1);
    }
};
main();
//# sourceMappingURL=db-backup.js.map