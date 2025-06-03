"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Logger;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = require("winston");
const winston_config_1 = __importDefault(require("@config/winston.config"));
const constants_1 = require("@utils/constants");
const datetime_1 = require("@utils/datetime");
// Создаем папку для логов, если она не существует
const logsDir = path_1.default.join(__dirname, "../", constants_1.LOGS_DIR);
if (!fs_1.default.existsSync(logsDir) && !constants_1.IS_DEV) {
    fs_1.default.mkdirSync(logsDir);
}
// Общий формат выводимых логов для всех транспортов
const getCommonFormat = (prefix = "") => winston_1.format.combine(winston_1.format.splat(), // Добавление плейсхолдеров (есть поддержка %s - строка, %d - число, %j - JSON объект)
winston_1.format.label({ label: prefix }), // Метка по умолчанию
winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Добавляем timestamp
winston_1.format.printf(({ level, message, timestamp, label }) => `${timestamp} ${label ? `${label}:` : ""}[${level}]: ${message}`));
/**
 * Инициализация логгера
 * У данного логгера есть несколько уровней выводов сообщений:
 * { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
 * То есть, если у транспорта указан уровень level: debug, то это означает,
 * что будет вывод логов debug и выше (4, 3, 2, 1 и 0, то есть всех, кроме 5 уровня)
 */
function Logger(prefix = "") {
    const logger = (0, winston_1.createLogger)({
        ...winston_config_1.default,
        format: getCommonFormat(prefix), // Используем общий формат
    });
    // Логи в консоль
    logger.add(new winston_1.transports.Console({
        level: "info", // Уровень логирования для консоли
        format: winston_1.format.combine(winston_1.format.colorize(), // Добавляем цвета для консоли
        getCommonFormat(prefix)),
    }));
    if (!constants_1.IS_DEV) {
        // Добавляем файловые транспорты только для продакшена
        logger.add(new winston_1.transports.File({
            level: "debug", // Уровень логирования для консоли
            filename: path_1.default.join(logsDir, `server-${datetime_1.timestamp}.log`), // Наименование файла, в который будут записываться логи всего сервера
            format: getCommonFormat(prefix), // Используем общий формат
        }));
    }
    return logger;
}
//# sourceMappingURL=logger.js.map