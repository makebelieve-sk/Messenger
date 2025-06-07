import { HOST, IS_HTTPS, PORT } from "./constants";

// Функция для получения текущего URL для Swagger
export function getBaseUrl() {
	const protocol = IS_HTTPS ? "https" : "http";
	return `${protocol}://${HOST}:${PORT}`;
}