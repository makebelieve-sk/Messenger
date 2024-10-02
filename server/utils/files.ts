import sharp from "sharp";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";

// Проверка, является ли файл изображением
export const isImage = (filename: string) => {
    const fileExt = filename.split(".").pop();
    const imgExts = ["png", "jpeg", "jpg"];

    return fileExt ? imgExts.includes(fileExt) : false;
};

export const ASSETS_PATH = "../assets";
const JPEG_FORMAT = "jpeg";

// Обрезаем качество файлу до 80% и сохраняем его на диск сервера
export async function createSharpedFile(file: Express.Multer.File) {
    const rootPath = path.join(__dirname, ASSETS_PATH);
    const folderPath = `/${file.fieldname}s/`;
    const outputFile = file.fieldname + "-" + uuid() + "." + file.mimetype.split("/").pop();

    // Проверка на наличие папки "assets"
    if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath);
    }

    // Проверка на наличие папок "avatars"/"photos"/"files"
    if (!fs.existsSync(path.join(rootPath, folderPath))) {
        fs.mkdirSync(path.join(rootPath, folderPath));
    }

    // Используем библиотеку sharp для сохранения метаданных изображения => изменения формата на "jpeg" => установки качества изображению 80% => вывод в файл
    await sharp(file.buffer)
        .withMetadata()
        .toFormat(JPEG_FORMAT)
        .jpeg({ quality: 80 })
        .toFile(path.join(rootPath, folderPath, outputFile));

    return { folderPath, outputFile };
}