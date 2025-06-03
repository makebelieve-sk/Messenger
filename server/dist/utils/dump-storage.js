"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareDumpFolder = prepareDumpFolder;
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("@utils/constants");
const files_1 = require("@utils/files");
const DUMP_DIR = (0, path_1.join)(__dirname, "../dumps");
/**
 * Функция для подготовки папки с резервной копией.
 * Если максимальное количество папок с резервными копиями базы данных уже есть,
 * то перезаписываем самую старую резервную копию, чтобы не засорять диск.
 */
function prepareDumpFolder() {
    // Если папка с резервными копиями базы данных не существует, то создаем ее
    if (!(0, fs_1.existsSync)(DUMP_DIR))
        (0, fs_1.mkdirSync)(DUMP_DIR);
    // Получаем все папки с резервными копиями базы данных
    const folders = (0, files_1.getAllSortedByTimestampFolders)(DUMP_DIR);
    // Если папок с резервными копиями базы данных больше максимального количества, то удаляем самую старую
    while (folders.length >= constants_1.DATABASE_MAX_BACKUPS) {
        // rmSync рекурсивно удаляет вложенные файлы и папки
        (0, fs_1.rmSync)((0, path_1.join)(DUMP_DIR, folders[0]), { recursive: true });
        folders.shift();
    }
    // Создаем новую папку для резервной копии
    const newFolder = `dump_${Date.now()}`;
    (0, fs_1.mkdirSync)((0, path_1.join)(DUMP_DIR, newFolder));
    return (0, path_1.join)(DUMP_DIR, newFolder);
}
;
//# sourceMappingURL=dump-storage.js.map