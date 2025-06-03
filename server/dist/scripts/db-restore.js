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
const zlib_1 = require("zlib");
const mssql_config_1 = __importDefault(require("@config/mssql.config"));
const crypto_dump_1 = require("@utils/crypto-dump");
const files_1 = require("@utils/files");
const constants_1 = require("@utils/constants");
const promises_1 = require("stream/promises");
const promises_2 = require("fs/promises");
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
const DUMPS_DIR = (0, path_1.join)(__dirname, "../dumps");
const RESTORE_FILE = "restore.bak";
async function main() {
    try {
        // Получаем последнюю папку с резервной копией
        const folders = (0, files_1.getAllSortedByTimestampFolders)(DUMPS_DIR);
        // Получаем имя папки с резервной копией из аргумента командной строки
        const dumpNameFromArgv = process.argv[2];
        const latestDump = dumpNameFromArgv
            ? folders.find(dumpName => dumpName === dumpNameFromArgv)
            : folders[folders.length - 1];
        if (!latestDump) {
            throw new Error(`No backups found.${dumpNameFromArgv
                ? ` Please, pass the correct dump name to the argument instead of "${dumpNameFromArgv}".`
                : ""}`);
        }
        // Получаем путь к папке с резервной копией
        const dumpPath = (0, path_1.join)(DUMPS_DIR, latestDump);
        // Получаем путь к файлу с резервной копией
        const backupPath = (0, path_1.join)(dumpPath, RESTORE_FILE);
        /**
         * Используем потоки для чтения и записи (поток Transform для расшифровки и распаковки).
         * Потоки позволяют не читать весь файл в память, а читать по частям.
         * Работа с файлами любого размера. Параллельная обработка. Минимальное использование памяти.
         */
        await (0, promises_1.pipeline)(
        // Ищем зашифрованный файл с резервной копией внутри найденной последней/указанной папки
        (0, fs_1.createReadStream)((0, path_1.join)(dumpPath, constants_1.BACKUP_ENCYPTED_FILE)), 
        // Расшифровываем резервную копию
        await (0, crypto_dump_1.createDecryptStream)(dumpPath), 
        // Распаковываем резервную копию
        (0, zlib_1.createGunzip)(), 
        // Сохраняем распакованную резервную копию в новый файл
        (0, fs_1.createWriteStream)(backupPath));
        const sequelize = new sequelize_1.Sequelize(mssql_config_1.default);
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
        await (0, promises_2.unlink)(backupPath);
        // eslint-disable-next-line no-console
        console.log("Temporary file removed successfully");
        // Успешно завершаем выполнение процесса
        process.exit(0);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Restore failed:", error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=db-restore.js.map