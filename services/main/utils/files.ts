import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuid } from "uuid";

import { t } from "@service/i18n";
import Logger from "@service/logger";
import { ASSETS_DIR, SHARP_QUALITY } from "@utils/constants";

const logger = Logger("utils/files");
const JPEG_FORMAT = "jpeg";
const ROOT_PATH = path.join(__dirname, "../", ASSETS_DIR);

// Проверка, является ли файл изображением
export const isImage = (filename: string) => {
	logger.debug("isImage [filename=%s]", filename);

	const fileExt = filename.split(".").pop();
	const imgExts = [ "png", "jpeg", "jpg" ];

	return fileExt ? imgExts.includes(fileExt) : false;
};

// Обрезаем качество изображению до 80% и сохраняем его на диск сервера
export async function createSharpedImage(file: Express.Multer.File) {
	logger.debug("createSharpedImage [file=%j]", file);

	const folderPath = `/${file.fieldname}s/`;
	const outputFile = file.fieldname + "-" + uuid() + "." + file.mimetype.split("/").pop();

	// Проверка на наличие папки "assets"
	if (!fs.existsSync(ROOT_PATH)) {
		fs.mkdirSync(ROOT_PATH);
	}

	// Проверка на наличие папок "avatars"/"photos"/
	if (!fs.existsSync(path.join(ROOT_PATH, folderPath))) {
		fs.mkdirSync(path.join(ROOT_PATH, folderPath));
	}

	/**
	 * Используем библиотеку sharp для:
	 * 1) сохранения метаданных изображения
	 * 2) изменения формата на "jpeg"
	 * 3) установки качества изображению 80%
	 * 4) вывод в новый файл
	 */
	const jpegBuffer = await sharp(file.buffer)
		.withMetadata()
		.toFormat(JPEG_FORMAT)
		.jpeg({ quality: SHARP_QUALITY, progressive: true })
		.toBuffer();

	await fs.promises.writeFile(
		path.join(ROOT_PATH, folderPath, outputFile),
		jpegBuffer,
	);

	return { folderPath, outputFile };
}

// Получение общей информации о фотографии (путь, размер, расширение)
export async function getPhotoInfo(photo: string) {
	logger.debug("getPhotoInfo [photo=%s]", photo);

	const photoPath = path.join(ROOT_PATH, photo);

	if (!fs.existsSync(photoPath)) {
		throw t("photos.error.photo_does_not_exist");
	}

	/**
	 * Получаем статистику файла (путь, размер, расширение) по пути.
	 * Путь уже содержит папку и наименование файла, например, avatars/avatar-....jpeg.
	 */
	const stats = fs.statSync(photoPath);

	return {
		path: photo,
		size: stats.size,
		extension: photoPath.split(".").pop() as string,
	};
}

// Получение всех папок в директории с сортировкой по дате создания
export function getAllSortedByTimestampFolders(dir: string) {
	return fs.readdirSync(dir)
		.filter(f => fs.statSync(path.join(dir, f)).isDirectory())
		.sort((a, b) =>
			fs.statSync(path.join(dir, a)).birthtime.getTime() -
			fs.statSync(path.join(dir, b)).birthtime.getTime(),
		);
}
