import dotenv from "dotenv";

/**
 * Данная переменная устанавливается (прописывается) в команде запуска сервера, так что она уже инициализирована.
 * Так что нет нужны ее прописывать в .env файлах.
 */
const MODE = process.env.NODE_ENV as string;

/**
 * Загружаем .env.<mode> в зависимости от значения NODE_ENV.
 * Это делается для того, чтобы был резервный файл по умолчанию .env, из которого подтягивались переменные,
 * которые мы забыли указать/не указали в файлах вида .env.<mode>
 */
dotenv.config({ path: `.env.${MODE}` });
dotenv.config();

// Список обязательных env переменных
const requiredEnv = [
	"PORT",
	"NODE_ENV",
	"MESSANGER_ENV",
	"CLIENT_URL",
	"COOKIE_NAME",
	"SECRET_KEY",
	"DATABASE_NAME",
	"DATABASE_USERNAME",
	"DATABASE_PASSWORD",
	"DATABASE_DIALECT",
	"DATABASE_HOST",
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
