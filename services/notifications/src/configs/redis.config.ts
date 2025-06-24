import { CONFIG_TYPE } from "src/types/enums";
import { registerAs } from "@nestjs/config";
import { Transport } from "@nestjs/microservices";

export interface RedisConfig {
	transport: Transport.REDIS;
	options: {
		host: string;
		port: number;
	};
}

// Генерация конфига RabbitMQ с env переменными
const redisConfig = registerAs<RedisConfig>(CONFIG_TYPE.REDIS, () => ({
	transport: Transport.REDIS,
	options: {
		host: process.env.REDIS_HOST as string,
		port: parseInt(process.env.REDIS_PORT as string) as number,
	},
}));

export default redisConfig;
