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

/**
 * Получает информацию о внешнем изображении (extension и size) из HTTP заголовков
 * Используется для OAuth авторизации (GitHub, Google), когда аватар приходит как внешний URL
 * 
 * @param url - URL изображения (например, "https://avatars.githubusercontent.com/u/123")
 * @returns объект с extension (из MIME type) и size (из Content-Length) или null если не удалось получить
 */
async function getExternalImageInfo(url: string): Promise<{ extension: string | null; size: number | null }> {
	try {
		// Делаем HEAD запрос для получения только заголовков (не скачиваем файл)
		const response = await fetch(url, { 
			method: "HEAD",
			signal: AbortSignal.timeout(5000), // таймаут 5 секунд
		});
		
		// Получаем Content-Type для определения extension
		const contentType = response.headers.get("content-type");
		let extension: string | null = null;
		
		if (contentType) {
			const mimeToExtension: Record<string, string> = {
				"image/jpeg": "jpeg",
				"image/jpg": "jpg",
				"image/png": "png",
				"image/gif": "gif",
				"image/bmp": "bmp",
				"image/webp": "webp",
			};
			
			const mimeType = contentType.split(";")[0].trim().toLowerCase();
			extension = mimeToExtension[mimeType] || null;
		}
		
		// Получаем размер файла из Content-Length заголовка
		const contentLength = response.headers.get("content-length");
		const size = contentLength ? parseInt(contentLength, 10) : null;
		
		logger.debug("getExternalImageInfo: URL=%s, extension=%s, size=%s", url, extension, size);
		
		return { extension, size };
	} catch (error) {
		logger.error("getExternalImageInfo: Failed to fetch info for URL %s: %s", url, (error as Error).message);
		return { extension: null, size: null };
	}
}

/**
 * Получение общей информации о фотографии (путь, размер файла, расширение)
 * Поддерживает как локальные пути, так и внешние URL (для OAuth авторизации через GitHub/Google)
 * 
 * @param photo - путь к локальному файлу (например, "avatars/avatar-123.jpeg") 
 *                или внешний URL (например, "https://avatars.githubusercontent.com/u/123")
 * @returns объект с path, size (в байтах) и extension
 * @throws ошибку если локальный файл не существует
 */
export async function getPhotoInfo(photo: string) {
	logger.debug("getPhotoInfo [photo=%s]", photo);

	// Проверка на внешний URL (для OAuth авторизации)
	if (photo.startsWith("http://") || photo.startsWith("https://")) {
		const { extension, size } = await getExternalImageInfo(photo);
		
		return {
			path: photo,
			size: size, // Размер файла из Content-Length заголовка или null
			extension: extension, // Расширение из MIME type или null
		};
	}

	// Существующая логика для локальных путей
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
