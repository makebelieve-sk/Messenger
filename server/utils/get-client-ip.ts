import { type Request } from "express";

// Получение ip адреса клиента, который дает запрос по HTTP
export const getClientIp = (req: Request) => {
	if (req.ip) return req.ip;

	const xForwardedFor = req.headers["x-forwarded-for"];

	// Если это массив — берём первый элемент, если строка — разбиваем
	const ipList = Array.isArray(xForwardedFor)
		? xForwardedFor[0]
		: (xForwardedFor || "").split(",");

	// Удаляем пробелы и берём первый IP
	const clientIp = (ipList[0] || "").trim();

	return clientIp || req.socket.remoteAddress || "unknown_ip";
};