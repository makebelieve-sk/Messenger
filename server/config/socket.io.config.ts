import * as constants from "@utils/constants";

const { CLIENT_URL, SOCKET_METHOD, SOCKET_PING_INTARVAL, SOCKET_PING_TIMEOUT, SOCKET_UPGRADE_TIMEOUT, SOCKET_MAX_DISCONNECTION_DURATION } = constants;

// Конфигурация socket.io
const socketIoConfig = {
	transports: [ "websocket" as const ], // Транспорт для соединений
	cors: {
		origin: CLIENT_URL, // Список разрешенных доменов
		// Список разрешенных методов запроса (разрешен только самый первый запрос для установки соединения между сервером и клиентом)
		methods: [ SOCKET_METHOD ],
		credentials: true, // Разрешает отправку cookie и других авторизационных данных
	},
	pingInterval: SOCKET_PING_INTARVAL, // Указываем с какой частотой идет heartbeat на клиент
	// Сколько может ожидать сервер ответа от клиента перед тем, как посчитает соединение закрытым (если клиент все равно не ответит)
	pingTimeout: SOCKET_PING_TIMEOUT,
	upgradeTimeout: SOCKET_UPGRADE_TIMEOUT, // Время, которое будет ожидать сервер до обновления 1-ого запроса (handshake) до указанного транспорта websocket
	connectionStateRecovery: {
		maxDisconnectionDuration: SOCKET_MAX_DISCONNECTION_DURATION, // Указывает время, в течении которого клиент может переподключиться
		skipMiddlewares: false, // При разрыве соединении не пропускаем мидлвары socket.io
	}, // Опция для восстановления соединения клиента из-за временного разрыва (например, спящий режим или потеря сети)
};

export default socketIoConfig;
