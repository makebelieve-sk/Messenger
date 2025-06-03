"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const constants_1 = require("@utils/constants");
// Конфигурация multer
const multerConfig = {
    storage: multer_1.default.memoryStorage(), // Хранилище файлов
    limits: {
        fileSize: constants_1.MB_1 * constants_1.MULTER_MAX_FILE_SIZE, // Ограничение на размер одного файла в 10 МБ
        files: constants_1.MULTER_MAX_FILES_COUNT, // Ограничение на количество файлов за один запрос
    },
};
exports.default = multerConfig;
//# sourceMappingURL=multer.config.js.map