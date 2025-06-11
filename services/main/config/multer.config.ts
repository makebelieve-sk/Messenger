import multer from "multer";

import { MB_1, MULTER_MAX_FILE_SIZE, MULTER_MAX_FILES_COUNT } from "@utils/constants";

// Конфигурация multer
const multerConfig = {
	storage: multer.memoryStorage(), // Хранилище файлов
	limits: {
		fileSize: MB_1 * MULTER_MAX_FILE_SIZE, // Ограничение на размер одного файла в 10 МБ
		files: MULTER_MAX_FILES_COUNT, // Ограничение на количество файлов за один запрос
	},
};

export default multerConfig;
