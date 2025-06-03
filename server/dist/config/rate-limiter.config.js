"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipLimiter = exports.sessionIdLimiter = void 0;
const common_types_1 = require("common-types");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const i18n_1 = require("@service/i18n");
const index_1 = require("@errors/index");
const constants_1 = require("@utils/constants");
const datetime_1 = require("@utils/datetime");
const get_client_ip_1 = require("@utils/get-client-ip");
// Ограничитель числа запросов для авторизованных пользователей (по sessionID) - 100 запросов за 1 минуту
exports.sessionIdLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMITER_AUTH_TIME_MINUTES * datetime_1.oneMinute, // в какое время разрешено использовать лимит запросов
    max: constants_1.RATE_LIMITER_AUTH_COUNT, // лимит запросов
    keyGenerator: req => {
        try {
            // Ключ = sessionId
            return req.sessionID;
        }
        catch (error) {
            throw new index_1.RateLimiterError(error.message); // Попадёт в глобальный обработчик
        }
    }, // Попадёт в глобальный обработчик (см. Middleware.catch)
    handler: (_, __, next) => {
        const error = new index_1.RateLimiterError((0, i18n_1.t)("config.rate-limiter.error.session_id"), common_types_1.HTTPStatuses.TooManyRequests);
        next(error);
    }, // Обработчик ошибки лимитера (передаем в общий обработчик ошибок express - см. Middleware.catch)
});
// Ограничитель числа запросов для неавторизованных пользователей (по IP) - 100 запросов за 1 минуту
exports.ipLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMITER_ANON_TIME_MINUTES * datetime_1.oneMinute, // в какое время разрешено использовать лимит запросов
    max: constants_1.RATE_LIMITER_ANON_COUNT, // жёстче лимит для неавторизованных пользователей
    keyGenerator: req => {
        try {
            // Ключ = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown_ip"
            return (0, get_client_ip_1.getClientIp)(req);
        }
        catch (error) {
            throw new index_1.RateLimiterError(error.message);
        }
    }, // Попадёт в глобальный обработчик (см. Middleware.catch)
    handler: (_, __, next) => {
        const error = new index_1.RateLimiterError((0, i18n_1.t)("config.rate-limiter.error.ip"), common_types_1.HTTPStatuses.TooManyRequests);
        next(error);
    }, // Обработчик ошибки лимитера (передаем в общий обработчик ошибок express - см. Middleware.catch)
});
//# sourceMappingURL=rate-limiter.config.js.map