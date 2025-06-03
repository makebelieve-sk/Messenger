"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImage = void 0;
exports.createSharpedImage = createSharpedImage;
exports.getPhotoInfo = getPhotoInfo;
exports.getAllSortedByTimestampFolders = getAllSortedByTimestampFolders;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const constants_1 = require("@utils/constants");
const logger = (0, logger_1.default)("utils/files");
const JPEG_FORMAT = "jpeg";
const ROOT_PATH = path_1.default.join(__dirname, "../", constants_1.ASSETS_DIR);
// Проверка, является ли файл изображением
const isImage = (filename) => {
    logger.debug("isImage [filename=%s]", filename);
    const fileExt = filename.split(".").pop();
    const imgExts = ["png", "jpeg", "jpg"];
    return fileExt ? imgExts.includes(fileExt) : false;
};
exports.isImage = isImage;
// Обрезаем качество изображению до 80% и сохраняем его на диск сервера
async function createSharpedImage(file) {
    logger.debug("createSharpedImage [file=%j]", file);
    const folderPath = `/${file.fieldname}s/`;
    const outputFile = file.fieldname + "-" + (0, uuid_1.v4)() + "." + file.mimetype.split("/").pop();
    // Проверка на наличие папки "assets"
    if (!fs_1.default.existsSync(ROOT_PATH)) {
        fs_1.default.mkdirSync(ROOT_PATH);
    }
    // Проверка на наличие папок "avatars"/"photos"/
    if (!fs_1.default.existsSync(path_1.default.join(ROOT_PATH, folderPath))) {
        fs_1.default.mkdirSync(path_1.default.join(ROOT_PATH, folderPath));
    }
    /**
     * Используем библиотеку sharp для:
     * 1) сохранения метаданных изображения
     * 2) изменения формата на "jpeg"
     * 3) установки качества изображению 80%
     * 4) вывод в новый файл
     */
    const jpegBuffer = await (0, sharp_1.default)(file.buffer)
        .withMetadata()
        .toFormat(JPEG_FORMAT)
        .jpeg({ quality: constants_1.SHARP_QUALITY, progressive: true })
        .toBuffer();
    await fs_1.default.promises.writeFile(path_1.default.join(ROOT_PATH, folderPath, outputFile), jpegBuffer);
    return { folderPath, outputFile };
}
// Получение общей информации о фотографии (путь, размер, расширение)
async function getPhotoInfo(photo) {
    logger.debug("getPhotoInfo [photo=%s]", photo);
    const photoPath = path_1.default.join(ROOT_PATH, photo);
    if (!fs_1.default.existsSync(photoPath)) {
        throw (0, i18n_1.t)("photos.error.photo_does_not_exist");
    }
    /**
     * Получаем статистику файла (путь, размер, расширение) по пути.
     * Путь уже содержит папку и наименование файла, например, avatars/avatar-....jpeg.
     */
    const stats = fs_1.default.statSync(photoPath);
    return {
        path: photo,
        size: stats.size,
        extension: photoPath.split(".").pop(),
    };
}
// Получение всех папок в директории с сортировкой по дате создания
function getAllSortedByTimestampFolders(dir) {
    return fs_1.default.readdirSync(dir)
        .filter(f => fs_1.default.statSync(path_1.default.join(dir, f)).isDirectory())
        .sort((a, b) => fs_1.default.statSync(path_1.default.join(dir, a)).birthtime.getTime() -
        fs_1.default.statSync(path_1.default.join(dir, b)).birthtime.getTime());
}
//# sourceMappingURL=files.js.map