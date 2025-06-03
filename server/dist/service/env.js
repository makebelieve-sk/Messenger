"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
/**
 * Данная переменная устанавливается (прописывается) в команде запуска сервера, так что она уже инициализирована.
 * Так что нет нужны ее прописывать в .env файлах.
 */
const MODE = process.env.NODE_ENV;
/**
 * Загружаем .env.<mode> в зависимости от значения NODE_ENV.
 * Это делается для того, чтобы был резервный файл по умолчанию .env, из которого подтягивались переменные,
 * которые мы забыли указать/не указали в файлах вида .env.<mode>
 */
dotenv_1.default.config({ path: `.env.${MODE}` });
dotenv_1.default.config();
// Список обязательных env переменных
const requiredEnv = [
    "PORT",
    "NODE_ENV",
    "MESSANGER_ENV",
    "CLIENT_URL",
    "COOKIE_NAME",
    "SECRET_KEY",
    "DATEBASE_NAME",
    "DATEBASE_USERNAME",
    "DATEBASE_PASSWORD",
    "DATEBASE_DIALECT",
    "DATEBASE_HOST",
    "DATABASE_PORT",
    "DATABASE_MAX_BACKUPS",
    "DATABASE_ENCRYPTION_PASSWORD",
    "REDIS_CONNECTION_URL",
    "REDIS_PREFIX",
    "SOCKET_METHOD",
    "EXPRESS_SESSION_DOMAIN",
    "LOGS_DIR",
    "ASSETS_DIR",
    "REPORTS_DIR",
    "DELETE_UNUSED_FILES_JOB_SCHEDULE",
    "BACKUP_JOB_SCHEDULE",
];
// Проверяем наличие обязательных env переменных
const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}
//# sourceMappingURL=env.js.map