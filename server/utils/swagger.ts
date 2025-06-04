import { HOST, IS_HTTPS, PORT } from "./constants";

export function getBaseUrl() {
	const protocol = IS_HTTPS ? "https" : "http";
	return `${protocol}://${HOST}:${PORT}`;
}