import { CONFIG_TYPE, INJECTION_KEYS, RABBITMQ_QUEUE } from "src/types/enums";
import { registerAs } from "@nestjs/config";
import { Transport } from "@nestjs/microservices/enums/transport.enum";

export interface RabbitMQConfig {
	mainUrl: string;
	name: string;
	transport: Transport.RMQ;
	options: {
		urls: string[];
		queue: string;
		queueOptions: {
			durable: boolean;
		};
	};
}

// Гененрация конфига RabbitMQ с env переменными на отправку/принятие сообщений в очереди нотификаций
export const rabbitNotificationConfig = registerAs<RabbitMQConfig>(
	CONFIG_TYPE.RABBITMQ_NOTIFICATION,
	() => ({
		mainUrl: process.env.RABBITMQ_URL as string,
		name: INJECTION_KEYS.RABBITMQ_NOTIFICATION_SERVER,
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL as string],
			queue: RABBITMQ_QUEUE.NOTIFICATION_QUEUE,
			queueOptions: {
				durable: true,
			},
		},
	}),
);

// Гененрация конфига RabbitMQ с env переменными на отправку/принятие сообщений в очереди ошибок нотификации
export const rabbitErrorNotificationConfig = registerAs<RabbitMQConfig>(
	CONFIG_TYPE.RABBITMQ_ERROR_NOTIFICATION,
	() => ({
		mainUrl: process.env.RABBITMQ_URL as string,
		name: INJECTION_KEYS.RABBITMQ_ERROR_NOTIFICATION_SERVER,
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL as string],
			queue: RABBITMQ_QUEUE.ERROR_NOTIFICATION_QUEUE,
			queueOptions: {
				durable: true,
			},
		},
	}),
);

// Гененрация конфига RabbitMQ с env переменными на отправку/принятие сообщений в очереди критических ошибок сервиса
export const rabbitErrorConfig = registerAs<RabbitMQConfig>(
	CONFIG_TYPE.RABBITMQ_ERROR,
	() => ({
		mainUrl: process.env.RABBITMQ_URL as string,
		name: INJECTION_KEYS.RABBITMQ_ERROR_SERVER,
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL as string],
			queue: RABBITMQ_QUEUE.ERROR_QUEUE,
			queueOptions: {
				durable: true,
			},
		},
	}),
);
