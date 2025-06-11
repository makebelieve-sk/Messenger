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
	REDIS_OPTIONS = "RedisOptions",
	DATABASE = "Database",
}

// Типы нотификаций (возможные типы стратегий)
export enum NOTIFICATION_TYPE {
	EMAIL = "EMAIL",
	SMS = "SMS",
	TELEGRAM = "TELEGRAM",
}

// Типы конфигураций
export enum CONFIG_TYPE {
	RABBITMQ_NOTIFICATION = "rabbitmq_notification",
	RABBITMQ_ERROR_NOTIFICATION = "rabbitmq_error_notification",
	RABBITMQ_ERROR = "rabbitmq_error",
	REDIS = "redis",
	DATABASE = "database",
}

// Типы очередей RabbitMQ
export enum RABBITMQ_QUEUE {
	NOTIFICATION_QUEUE = "notification_queue",
	ERROR_NOTIFICATION_QUEUE = "error_notification_queue",
	ERROR_QUEUE = "error_queue",
}

// Типы ошибок в пользовательских ошибках
export enum ERRORS {
	ERROR_CONFIG = "ERROR_CONFIG",
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

// Каналы Redis
export enum REDIS_CHANNEL {
	HEARTBEAT = "heartbeat_channel",
	FAILED_NOTIFICATIONS = "failed_notifications_channel",
	CRITICAL_ERRORS = "critical_errors_channel",
}

// Типы действия стратегии
export enum STRATEGY_ACTION {
	NEW_NOTIFICATION = "NEW_NOTIFICATION",
	PINCODE = "PINCODE",
	LOGIN = "LOGIN",
}
