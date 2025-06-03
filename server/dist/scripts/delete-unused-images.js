"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line simple-import-sort/imports
require("@service/env");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const sequelize_1 = require("sequelize");
const worker_threads_1 = require("worker_threads");
const mssql_config_1 = __importDefault(require("@config/mssql.config"));
const constants_1 = require("@utils/constants");
const ASSETS_FOLDER = (0, path_1.join)(__dirname, "../", constants_1.ASSETS_DIR);
const AVATARS_FOLDER = (0, path_1.join)(ASSETS_FOLDER, "avatars");
// const FILES_FOLDER = join(ASSETS_FOLDER, "files");
const PHOTOS_FOLDER = (0, path_1.join)(ASSETS_FOLDER, "photos");
// Удаление неиспользуемых файлов, в том числе фотографий (чаты/профиль), аватаров и файлов (чаты)
async function main() {
    const sequelize = new sequelize_1.Sequelize(mssql_config_1.default);
    // Проверяем существование папки с файлами проекта
    if (!(0, fs_1.existsSync)(ASSETS_FOLDER)) {
        throw new Error("Assets FOLDER does not exist");
    }
    const filesToRead = [
        (0, promises_1.readdir)(AVATARS_FOLDER),
        // readdir(FILES_FOLDER),
        (0, promises_1.readdir)(PHOTOS_FOLDER),
    ];
    // Получаем список файлов из всех указанных папок с файлами проекта
    const files = await Promise
        .all(filesToRead)
        .then(([avatars, photos]) => {
        return [
            ...avatars.map(avatar => `\\avatars\\${avatar}`),
            // ...files.map(file => `\\files\\${file}`),
            ...photos.map(photo => `\\photos\\${photo}`),
        ];
    });
    // Проверяем существование в БД (пачками по 1000)
    const chunkSize = 1000;
    const existingFiles = new Set();
    // Получаем список файлов из БД батчингом, чтобы не грузить сильно базу данных
    for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files
            .slice(i, i + chunkSize)
            .map(file => `'${file.replace(/'/g, "''")}'`) // Экранируем кавычки
            .join(",");
        const photos = await sequelize.query(`
            SELECT path 
            FROM Photos 
            WHERE path IN (${chunk})
        `, {
            type: sequelize_1.QueryTypes.SELECT,
        });
        photos.forEach(photo => existingFiles.add(photo.path));
    }
    // Фильтруем файлы для удаления
    const filesToDelete = files.filter(file => !existingFiles.has(file));
    // Параллельное удаление файлов
    await Promise.all(filesToDelete.map(file => (0, promises_1.unlink)((0, path_1.join)(ASSETS_FOLDER, file))
        .catch((error) => {
        throw new Error(`Error deleting ${file}:${error}`);
    })));
    // Закрываем соединение с БД
    await sequelize.close();
    return filesToDelete.length;
}
// Проверка запуска файла в отдельном потоке
if (!worker_threads_1.isMainThread && worker_threads_1.parentPort) {
    worker_threads_1.parentPort.on("message", async () => {
        try {
            // Выполнение очистки неиспользуемых файлов
            const result = await main();
            // Отправка данных в главный поток
            worker_threads_1.parentPort.postMessage({ success: true, count: result });
            // Завершение работы дочернего воркера
            process.exit(0);
        }
        catch (error) {
            // Отправка ошибки в главный поток
            worker_threads_1.parentPort.postMessage({ success: false, error: error.message });
            // Завершение работы дочернего воркера с кодом 1, что означает ошибочное завершение работы дочернего воркера
            process.exit(1);
        }
    });
}
else {
    // eslint-disable-next-line no-console
    console.warn("Этот файл должен быть запущен в отдельном потоке!");
}
//# sourceMappingURL=delete-unused-images.js.map