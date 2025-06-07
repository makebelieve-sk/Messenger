// Устанавливаем необязательным env переменным значения по умолчанию
export const PORT = process.env.PORT as "8008";
export const NODE_ENV = process.env.NODE_ENV as "development" | "production" | "test";
export const MESSANGER_ENV = process.env.MESSANGER_ENV as "development" | "stage" | "production";
export const CLIENT_URL = process.env.CLIENT_URL as string;
export const COOKIE_NAME = process.env.COOKIE_NAME as string;
export const SECRET_KEY = process.env.SECRET_KEY as string;

export const DATEBASE_DOWN_MIGRATIONS = process.env.DATEBASE_DOWN_MIGRATIONS === "true";
export const DATABASE_SHOW_DEV_LOGS = process.env.DATABASE_SHOW_DEV_LOGS === "true";

export const DATEBASE_NAME = process.env.DATEBASE_NAME as string;
export const DATEBASE_USERNAME = process.env.DATEBASE_USERNAME as string;
export const DATEBASE_PASSWORD = process.env.DATEBASE_PASSWORD as string;
export const DATEBASE_DIALECT = process.env.DATEBASE_DIALECT as "mysql" | "postgres" | "sqlite" | "mssql";
export const DATABASE_DIALECT_REQUEST_TIMEOUT = process.env.DATABASE_DIALECT_REQUEST_TIMEOUT ? Number(process.env.DATABASE_DIALECT_REQUEST_TIMEOUT) : 15000;
export const DATEBASE_HOST = process.env.DATEBASE_HOST as string;
export const DATABASE_PORT = Number(process.env.DATABASE_PORT);
export const DATABASE_RETRY_ATTEMPTS = process.env.DATABASE_RETRY_ATTEMPTS ? Number(process.env.DATABASE_RETRY_ATTEMPTS) : 1;
export const DATABASE_POOL_MAX = process.env.DATABASE_POOL_MAX ? Number(process.env.DATABASE_POOL_MAX) : 20;
export const DATABASE_POOL_MIN = process.env.DATABASE_POOL_MIN ? Number(process.env.DATABASE_POOL_MIN) : 5;
export const DATABASE_POOL_ACQUIRE = process.env.DATABASE_POOL_ACQUIRE ? Number(process.env.DATABASE_POOL_ACQUIRE) : 30000;
export const DATABASE_POOL_IDLE = process.env.DATABASE_POOL_IDLE ? Number(process.env.DATABASE_POOL_IDLE) : 10000;
export const DATABASE_MAX_BACKUPS = Number(process.env.DATABASE_MAX_BACKUPS);
export const DATABASE_ENCRYPTION_PASSWORD = process.env.DATABASE_ENCRYPTION_PASSWORD as string;

export const REDIS_CONNECTION_URL = process.env.REDIS_CONNECTION_URL as string;
export const REDIS_PREFIX = process.env.REDIS_PREFIX as string;
export const REDIS_TTL = process.env.REDIS_TTL ? Number(process.env.REDIS_TTL) : 3600;
export const REDIS_TIMEOUT_RECONNECTION = process.env.REDIS_TIMEOUT_RECONNECTION ? Number(process.env.REDIS_TIMEOUT_RECONNECTION) : 5000;

export const SOCKET_METHOD = process.env.SOCKET_METHOD as string;
export const SOCKET_PING_INTARVAL = process.env.SOCKET_PING_INTARVAL ? Number(process.env.SOCKET_PING_INTARVAL) : 25000;
export const SOCKET_PING_TIMEOUT = process.env.SOCKET_PING_TIMEOUT ? Number(process.env.SOCKET_PING_TIMEOUT) : 5000;
export const SOCKET_UPGRADE_TIMEOUT = process.env.SOCKET_UPGRADE_TIMEOUT ? Number(process.env.SOCKET_UPGRADE_TIMEOUT) : 10000;
export const SOCKET_MAX_DISCONNECTION_DURATION = process.env.SOCKET_MAX_DISCONNECTION_DURATION ? Number(process.env.SOCKET_MAX_DISCONNECTION_DURATION) : 5000;
export const SOCKET_ACK_TIMEOUT = process.env.SOCKET_ACK_TIMEOUT ? Number(process.env.SOCKET_ACK_TIMEOUT) : 10000;

export const EXPRESS_SESSION_DOMAIN = process.env.EXPRESS_SESSION_DOMAIN as string;

export const MULTER_MAX_FILE_SIZE = process.env.MULTER_MAX_FILE_SIZE ? Number(process.env.MULTER_MAX_FILE_SIZE) : 10;
export const MULTER_MAX_FILES_COUNT = process.env.MULTER_MAX_FILES_COUNT ? Number(process.env.MULTER_MAX_FILES_COUNT) : 10;

export const SHARP_QUALITY = process.env.SHARP_QUALITY ? Number(process.env.SHARP_QUALITY) : 80;

export const LOGS_DIR = process.env.LOGS_DIR as string;
export const ASSETS_DIR = process.env.ASSETS_DIR as string;
export const REPORTS_DIR = process.env.REPORTS_DIR as string;

export const RATE_LIMITER_AUTH_TIME_MINUTES = process.env.RATE_LIMITER_AUTH_TIME_MINUTES ? Number(process.env.RATE_LIMITER_AUTH_TIME_MINUTES) : 15;
export const RATE_LIMITER_ANON_TIME_MINUTES = process.env.RATE_LIMITER_ANON_TIME_MINUTES ? Number(process.env.RATE_LIMITER_ANON_TIME_MINUTES) : 15;
export const RATE_LIMITER_AUTH_COUNT = process.env.RATE_LIMITER_AUTH_COUNT ? Number(process.env.RATE_LIMITER_AUTH_COUNT) : 100;
export const RATE_LIMITER_ANON_COUNT = process.env.RATE_LIMITER_ANON_COUNT ? Number(process.env.RATE_LIMITER_ANON_COUNT) : 20;

export const DELETE_UNUSED_FILES_JOB_SCHEDULE = process.env.DELETE_UNUSED_FILES_JOB_SCHEDULE as string;
export const BACKUP_JOB_SCHEDULE = process.env.BACKUP_JOB_SCHEDULE as string;

// Далее пошли обычные переменные, используемые в проекте
export const IS_DEV = NODE_ENV === "development";
export const IS_HTTPS = MESSANGER_ENV !== "production";
export const MB_1 = 1024 * 1024;
export const SOCKET_MIDDLEWARE_ERROR = "SOCKET_MIDDLEWARE_ERROR";
export const BACKUP_ENCYPTED_FILE = "backup.enc";
