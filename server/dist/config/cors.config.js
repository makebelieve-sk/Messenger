"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const constants_1 = require("@utils/constants");
const datetime_1 = require("@utils/datetime");
// Конфигурация политики CORS
const corsConfig = {
    credentials: true, // Разрешает отправку и обработку cookies на клиенте
    origin: constants_1.CLIENT_URL, // Какие домены/протоколы/порты могут отправлять запросы к серверу
    methods: ["GET", "POST", "PUT", "DELETE"], // Какие http-методы разрешены
    maxAge: datetime_1.oneHour, // Время, в течении которого браузер кеширует результаты preflight-запросов (OPTIONS)
    preflightContinue: false, // Отключаем продолжение preflight запросов
    optionsSuccessStatus: common_types_1.HTTPStatuses.NoContent, // Статус успешного ответа для OPTIONS запросов
};
exports.default = corsConfig;
//# sourceMappingURL=cors.config.js.map