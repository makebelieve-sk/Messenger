"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@service/logger"));
const constants = __importStar(require("@utils/constants"));
const logger = (0, logger_1.default)("Database");
const { DATEBASE_PASSWORD, DATEBASE_USERNAME, DATABASE_PORT, DATABASE_DIALECT_REQUEST_TIMEOUT, DATABASE_POOL_ACQUIRE, DATABASE_POOL_IDLE, DATABASE_POOL_MAX, DATABASE_POOL_MIN, DATABASE_RETRY_ATTEMPTS, DATABASE_SHOW_DEV_LOGS, DATEBASE_DIALECT, DATEBASE_HOST, DATEBASE_NAME, } = constants;
const loggerFunction = DATABASE_SHOW_DEV_LOGS ? logger.info : logger.debug;
// Уровень вывода логов всех запросов к базе данных
function showLogs(logMessage) {
    loggerFunction(logMessage);
}
// Конфигурация MS SQL
const mssqlConfig = {
    username: DATEBASE_USERNAME, // Имя пользователя для подключения к базе данных
    password: DATEBASE_PASSWORD, // Пароль пользователя для подключения к базе данных
    database: DATEBASE_NAME, // Наименование базы данных
    dialect: DATEBASE_DIALECT, // Диалект базы данных (mysql/sqlite/postgres/mssql) - то есть настройки для драйвера
    dialectOptions: {
        options: {
            encrypt: true, // Шифрует соединение между сервером и БД (обязателен в Azure SQL Server)
            enableArithAbort: true, // Следует ли прерывать запросы при арифметических ошибках (рекомендуется для MSSQL)
            requestTimeout: DATABASE_DIALECT_REQUEST_TIMEOUT, // 15 секунд на выполнение запроса
            multipleActiveResultSets: true, // Разрешить несколько активных наборов результатов (MARS)
        },
        useUTC: true, // Гарантирует, что время сохраняется в БД и возвращается из БД в UTC
    }, // Опции диалекта
    host: DATEBASE_HOST, // Адрес сервера базы данных
    port: DATABASE_PORT, // Порт для подключения к базе данных
    define: {
        freezeTableName: true, // Отключение автоматических имен таблиц
        timestamps: false, // Включает создание createdAt и updatedAt поля в таблицах
        paranoid: false, // Отключает мягкое удаление (записи удаляются из таблиц, поля deletedAt нет)
        underscored: true, // Использовать snake_case в БД вместо camelCase
    }, // Глобальные настройки для всех моделей
    logging: showLogs, // Логирование sql запросов
    logQueryParameters: true, // Логирует параметры запросов
    benchmark: false, // Время выполнения запроса в логах
    retry: {
        max: DATABASE_RETRY_ATTEMPTS, // Повторять запрос в случае ошибки
    },
    pool: {
        max: DATABASE_POOL_MAX, // Максимальное количество соединений
        min: DATABASE_POOL_MIN, // Минимальное количество соединений
        acquire: DATABASE_POOL_ACQUIRE, // Время ожидания перед ошибкой при создании нового соединения (ms) - если все соединения заняты
        idle: DATABASE_POOL_IDLE, // Время простоя перед закрытием пустого соединения (ms)
    }, // Пул соединений (позволяет Sequelize переиспользовать существующие соединения вместо создания новых при каждом запросе)
};
exports.default = mssqlConfig;
//# sourceMappingURL=mssql.config.js.map