// Ключи инъекций
export enum INJECTION_KEYS {
	RABBITMQ_NOTIFICATION_SERVER = "RabbitMQNotificationsServer",
	RABBITMQ_ERROR_NOTIFICATION_SERVER = "RabbitMQErrorNotificationsServer",
	RABBITMQ_ERROR_SERVER = "RabbitMQErrorServer",
	EMAIL_STRATEGY = "EmailStrategy",
	SMS_STRATEGY = "SMSStrategy",
	TELEGRAM_STRATEGY = "TelegramStrategy",
	NOTIFICATION_STRATEGIES = "NotificationStrategies",
	REDIS_SERVER = "RedisServer",
	IOREDIS_OPTIONS = "IORedisOptions",
	NODEMAILER_SERVER = "NodemailerServer",
	NODE_TELEGRAM = "NodeTelegram",
}

// Типы конфигураций
export enum CONFIG_TYPE {
	RABBITMQ_NOTIFICATION = "rabbitmq_notification",
	RABBITMQ_ERROR_NOTIFICATION = "rabbitmq_error_notification",
	RABBITMQ_ERROR = "rabbitmq_error",
	REDIS = "redis",
	DATABASE = "database",
	NODEMAILER = "nodemailer",
	NODE_TELEGRAM = "node_telegram",
}

// Типы ошибок в пользовательских ошибках
export enum ERRORS {
	APP_ERROR = "APP_ERROR",
	ERROR_CONFIG = "ERROR_CONFIG",
	STRATEGY_ERROR = "STRATEGY_ERROR",
	DATABASE_ERROR = "DATABASE_ERROR",
}

// Возможные отправляемые типы сообщений в ошибочной очереди RabbitMQ
export enum RabbitMQ_SEND_TYPE {
	APP_ERROR = "APP_ERROR",
	HTTP_ERROR = "HTTP_ERROR",
	MSSQL_ERROR = "MSSQL_ERROR",
}

// Типы контекста соединения, используемые в сервисе
export enum CONTEXT_TYPE {
	RPC = "rpc",
	HTTP = "http",
}
