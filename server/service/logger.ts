import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";

import { timestamp } from "@utils/datetime";

const LOGS_PATH = "../logs";

// Создаем папку для логов, если она не существует
const logDir = path.join(__dirname, LOGS_PATH);

if (!fs.existsSync(logDir) && process.env.NODE_ENV === "production") {
    fs.mkdirSync(logDir);
}

// Общий формат выводимых логов для всех транспортов
const getCommonFormat = (prefix: string = "") => format.combine(
    format.splat(),                                                    // Добавление плейсхолдеров (есть поддержка %s - строка, %d - число, %j - JSON объект)
    format.label({ label: prefix }),                                   // Метка по умолчанию
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),               // Добавляем timestamp
    format.printf(({ level, message, timestamp, label }) => `${timestamp} ${label ? `${label}:` : ""}[${level}]: ${message}`)     // Формат логов
);

// Инициализация логгера
// У данного логгера есть несколько уровней выводов сообщений:
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
// То есть, если у транспорта указан уровень level: debug, то это означает, что будет вывод логов debug и выше (4, 3, 2, 1 и 0, то есть всех, кроме 5 уровня)
export default function Logger(prefix: string = "") {
    const logger = createLogger({
        level: "debug",                                                     // Уровень логирования
        format: getCommonFormat(prefix),                                    // Используем общий формат
        transports: [
            // Логи в консоль (только для разработки)
            new transports.Console({
                level: "info",                                              // Уровень логирования для консоли
                format: format.combine(
                    format.colorize(),                                      // Добавляем цвета для консоли
                    getCommonFormat(prefix)                                 // Используем общий формат
                )
            })
        ]
    });

    if (process.env.NODE_ENV === "production") {
        // Добавляем файловые транспорты только для продакшена
        logger.add(new transports.File({
            level: "debug",                                                 // Уровень логирования для консоли
            filename: path.join(__dirname, LOGS_PATH, `server-${timestamp}.log`),
            format: getCommonFormat(prefix)                                 // Используем общий формат
        }));
    
        // Отключаем логи в консоль для продакшена
        logger.remove(new transports.Console());
    }

    return logger;
}