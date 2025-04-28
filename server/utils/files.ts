import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuid } from "uuid";

import Logger from "@service/logger";

const logger = Logger("utils/files");
const JPEG_FORMAT = "jpeg";
const SHARP_QUALITY = parseInt(process.env.SHARP_QUALITY as string);

export const MB_1 = 1024 * 1024;
export const ASSETS_PATH = "../assets";
export const PUBLIC_PATH = "../../app/public";

// Проверка, является ли файл изображением
export const isImage = (filename: string) => {
    logger.debug("isImage [filename=%s]", filename);

    const fileExt = filename.split(".").pop();
    const imgExts = ["png", "jpeg", "jpg"];

    return fileExt ? imgExts.includes(fileExt) : false;
};

// Обрезаем качество изображению до 80% и сохраняем его на диск сервера
export async function createSharpedImage(file: Express.Multer.File) {
    logger.debug("createSharpedImage [file=%j]", file);

    const rootPath = path.join(__dirname, ASSETS_PATH);
    const folderPath = `/${file.fieldname}s/`;
    const outputFile = file.fieldname + "-" + uuid() + "." + file.mimetype.split("/").pop();

    // Проверка на наличие папки "assets"
    if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath);
    }

    // Проверка на наличие папок "avatars"/"photos"/
    if (!fs.existsSync(path.join(rootPath, folderPath))) {
        fs.mkdirSync(path.join(rootPath, folderPath));
    }

    // Используем библиотеку sharp для сохранения метаданных изображения => изменения формата на "jpeg" => установки качества изображению 80% => вывод в новый файл
    await sharp(file.buffer)
        .withMetadata()
        .toFormat(JPEG_FORMAT)
        .jpeg({ quality: SHARP_QUALITY, progressive: true })
        .toFile(path.join(rootPath, folderPath, outputFile));

    return { folderPath, outputFile };
}