import { type RedisClientType } from "redis";

import * as constants from "@utils/constants";

const { REDIS_CONNECTION_URL, REDIS_PREFIX, REDIS_TTL } = constants;

// Конфигурация клиента и хранилища Redis
const redisConfig = {
	client: {
		url: REDIS_CONNECTION_URL, // URL-адрес для подключения к Redis серверу
	},
	store: (client: RedisClientType) => ({
		client, // Клиент Redis
		prefix: REDIS_PREFIX, // Префикс ключа по умолчанию
		ttl: REDIS_TTL, // Устанавливаем начальное время жизни записи в хранилище
	}),
};

export default redisConfig;
