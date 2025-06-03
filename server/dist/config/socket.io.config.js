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
Object.defineProperty(exports, "__esModule", { value: true });
const constants = __importStar(require("@utils/constants"));
const { CLIENT_URL, SOCKET_METHOD, SOCKET_PING_INTARVAL, SOCKET_PING_TIMEOUT, SOCKET_UPGRADE_TIMEOUT, SOCKET_MAX_DISCONNECTION_DURATION } = constants;
// Конфигурация socket.io
const socketIoConfig = {
    transports: ["websocket"], // Транспорт для соединений
    cors: {
        origin: CLIENT_URL, // Список разрешенных доменов
        // Список разрешенных методов запроса (разрешен только самый первый запрос для установки соединения между сервером и клиентом)
        methods: [SOCKET_METHOD],
        credentials: true, // Разрешает отправку cookie и других авторизационных данных
        allowedHeaders: ["Content-Type", "Authorization"],
    },
    pingInterval: SOCKET_PING_INTARVAL, // Указываем с какой частотой идет heartbeat на клиент
    // Сколько может ожидать сервер ответа от клиента перед тем, как посчитает соединение закрытым (если клиент все равно не ответит)
    pingTimeout: SOCKET_PING_TIMEOUT,
    upgradeTimeout: SOCKET_UPGRADE_TIMEOUT, // Время, которое будет ожидать сервер до обновления 1-ого запроса (handshake) до указанного транспорта websocket
    connectionStateRecovery: {
        maxDisconnectionDuration: SOCKET_MAX_DISCONNECTION_DURATION, // Указывает время, в течении которого клиент может переподключиться
        skipMiddlewares: false, // При разрыве соединении не пропускаем мидлвары socket.io
    }, // Опция для восстановления соединения клиента из-за временного разрыва (например, спящий режим или потеря сети)
    allowEIO3: false, // Отключаем поддержку Engine.IO версии 3
    allowUpgrades: true, // Разрешаем обновление соединения до WebSocket
    perMessageDeflate: {
        threshold: 2048, // Минимальный размер сообщения для сжатия
    },
};
exports.default = socketIoConfig;
//# sourceMappingURL=socket.io.config.js.map