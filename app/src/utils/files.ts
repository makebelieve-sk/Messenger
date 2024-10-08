// Максимальный размер файла в байтах (10 МБ)
export const MAX_FILE_SIZE = 10000000;
// Наименование поля аватара пользователя
export const AVATAR_URL = "avatarUrl";

// Расчёт размера файла
export const currentSize = (size: number) => {
    const units = ["B", "KB", "MB", "GB"];

    const exponent = Math.min(
        Math.floor(Math.log(size) / Math.log(1024)),
        units.length - 1
    );

    const approx = size / 1024 ** exponent;
    const output = exponent === 0
        ? `${size} байт`
        : `${approx.toFixed(1)} ${units[exponent]}`;

    return output;
};

// Проверка, является ли файл изображением
export const isImage = (filename: string) => {
    const fileExt = filename.split(".").pop();
    const imgExts = ["png", "jpeg", "jpg"];

    return fileExt ? imgExts.includes(fileExt) : false;
};