import i18next from "@service/i18n";
import Logger from "@service/Logger";

const logger = Logger.init("utils/files");

// Расчёт размера файла
export const currentSize = (size: number) => {
	logger.debug(`currentSize [size=${size}]`);

	const units = [ "B", "KB", "MB", "GB" ];

	const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);

	const approx = size / 1024 ** exponent;
	const output = exponent === 0 ? `${size} ${i18next.t("utils.byte")}` : `${approx.toFixed(1)} ${units[exponent]}`;

	return output;
};

// Проверка, является ли файл изображением
export const isImage = (filename: string) => {
	logger.debug(`isImage [filename=${filename}]`);

	const fileExt = filename.split(".").pop();
	const imgExts = [ "png", "jpeg", "jpg" ];

	return fileExt ? imgExts.includes(fileExt) : false;
};
