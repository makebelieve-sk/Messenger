import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";

import winstonConfig from "@config/winston.config";
import { IS_DEV, LOGS_DIR } from "@utils/constants";
import { timestamp } from "@utils/datetime";

// Создаем папку для логов, если она не существует
const logsDir = path.join(__dirname, "../", LOGS_DIR);

if (!fs.existsSync(logsDir) && !IS_DEV) {
	fs.mkdirSync(logsDir);
}

// Общий формат выводимых логов для всех транспортов
const getCommonFormat = (prefix: string = "") =>
	format.combine(
		format.splat(), // Добавление плейсхолдеров (есть поддержка %s - строка, %d - число, %j - JSON объект)
		format.label({ label: prefix }), // Метка по умолчанию
		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Добавляем timestamp
		format.printf(({ level, message, timestamp, label }) => `${timestamp} ${label ? `${label}:` : ""}[${level}]: ${message}`), // Формат логов
	);

/**
 * Инициализация логгера
 * У данного логгера есть несколько уровней выводов сообщений:
 * { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
 * То есть, если у транспорта указан уровень level: debug, то это означает,
 * что будет вывод логов debug и выше (4, 3, 2, 1 и 0, то есть всех, кроме 5 уровня)
 */
export default function Logger(prefix: string = "") {
	const logger = createLogger({
		...winstonConfig,
		format: getCommonFormat(prefix), // Используем общий формат
	});

	if (IS_DEV) {
		// Логи в консоль
		logger.add(
			new transports.Console({
				level: "info", // Уровень логирования для консоли
				format: format.combine(
					format.colorize(), // Добавляем цвета для консоли
					getCommonFormat(prefix), // Используем общий формат
				),
			}),
		);
	} else {
		// Добавляем файловые транспорты только для продакшена
		logger.add(
			new transports.File({
				level: "debug", // Уровень логирования для консоли
				filename: path.join(logsDir, `server-${timestamp}.log`), // Наименование файла, в который будут записываться логи всего сервера
				format: getCommonFormat(prefix), // Используем общий формат
			}),
		);
	}

	return logger;
}
