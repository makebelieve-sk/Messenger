import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";

import { t } from "@service/i18n";
import { RateLimiterError } from "@errors/index";
import { HTTPStatuses } from "@custom-types/enums";
import { RATE_LIMITER_ANON_COUNT, RATE_LIMITER_ANON_TIME_MINUTES, RATE_LIMITER_AUTH_COUNT, RATE_LIMITER_AUTH_TIME_MINUTES } from "@utils/constants";
import { oneMinute } from "@utils/datetime";
import { getClientIp } from "@utils/get-client-ip";

// Ограничитель числа запросов для авторизованных пользователей (по sessionID) - 100 запросов за 1 минуту
export const sessionIdLimiter = rateLimit({
	windowMs: RATE_LIMITER_AUTH_TIME_MINUTES * oneMinute, // в какое время разрешено использовать лимит запросов
	max: RATE_LIMITER_AUTH_COUNT, // лимит запросов
	keyGenerator: req => {
		try {
			// Ключ = sessionId
			return req.sessionID;
		} catch (error) {
			throw new RateLimiterError((error as Error).message); // Попадёт в глобальный обработчик
		}
	}, // Попадёт в глобальный обработчик (см. Middleware.catch)
	handler: (_: Request, __: Response, next: NextFunction) => {
		const error = new RateLimiterError(t("config.rate-limiter.error.session_id"), HTTPStatuses.TooManyRequests);
		next(error);
	}, // Обработчик ошибки лимитера (передаем в общий обработчик ошибок express - см. Middleware.catch)
});

// Ограничитель числа запросов для неавторизованных пользователей (по IP) - 100 запросов за 1 минуту
export const ipLimiter = rateLimit({
	windowMs: RATE_LIMITER_ANON_TIME_MINUTES * oneMinute, // в какое время разрешено использовать лимит запросов
	max: RATE_LIMITER_ANON_COUNT, // жёстче лимит для неавторизованных пользователей
	keyGenerator: req => {
		try {
			// Ключ = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown_ip"
			return getClientIp(req);
		} catch (error) {
			throw new RateLimiterError((error as Error).message);
		}
	}, // Попадёт в глобальный обработчик (см. Middleware.catch)
	handler: (_: Request, __: Response, next: NextFunction) => {
		const error = new RateLimiterError(t("config.rate-limiter.error.ip"), HTTPStatuses.TooManyRequests);
		next(error);
	}, // Обработчик ошибки лимитера (передаем в общий обработчик ошибок express - см. Middleware.catch)
});