import Logger from "@service/logger";
import * as constants from "@utils/constants";

const logger = Logger("Database");
const {
	DATABASE_PASSWORD,
	DATABASE_USERNAME,
	DATABASE_PORT,
	DATABASE_DIALECT_REQUEST_TIMEOUT,
	DATABASE_POOL_ACQUIRE,
	DATABASE_POOL_IDLE,
	DATABASE_POOL_MAX,
	DATABASE_POOL_MIN,
	DATABASE_RETRY_ATTEMPTS,
	DATABASE_SHOW_DEV_LOGS,
	DATABASE_DIALECT,
	DATABASE_HOST,
	DATABASE_NAME,
} = constants;

const loggerFunction = DATABASE_SHOW_DEV_LOGS ? logger.info : logger.debug;

// Уровень вывода логов всех запросов к базе данных
function showLogs(logMessage: string) {
	loggerFunction(logMessage);
}

// Конфигурация MS SQL
const mssqlConfig = {
	username: DATABASE_USERNAME, // Имя пользователя для подключения к базе данных
	password: DATABASE_PASSWORD, // Пароль пользователя для подключения к базе данных
	database: DATABASE_NAME, // Наименование базы данных
	dialect: DATABASE_DIALECT, // Диалект базы данных (mysql/sqlite/postgres/mssql) - то есть настройки для драйвера
	dialectOptions: {
		options: {
			encrypt: true, // Шифрует соединение между сервером и БД (обязателен в Azure SQL Server)
			enableArithAbort: true, // Следует ли прерывать запросы при арифметических ошибках (рекомендуется для MSSQL)
			requestTimeout: DATABASE_DIALECT_REQUEST_TIMEOUT, // 15 секунд на выполнение запроса
			multipleActiveResultSets: true, // Разрешить несколько активных наборов результатов (MARS)
		},
		useUTC: true, // Гарантирует, что время сохраняется в БД и возвращается из БД в UTC
	}, // Опции диалекта
	host: DATABASE_HOST, // Адрес сервера базы данных
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

export default mssqlConfig;
