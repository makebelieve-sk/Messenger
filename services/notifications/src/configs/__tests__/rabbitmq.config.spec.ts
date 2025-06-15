import {
	rabbitErrorConfig,
	rabbitErrorNotificationConfig,
	rabbitNotificationConfig,
} from "src/configs/rabbitmq.config";
import { INJECTION_KEYS, RABBITMQ_QUEUE } from "src/types/enums";
import { Transport } from "@nestjs/microservices/enums/transport.enum";

describe("RabbitMQ Config", () => {
	const mockRabbitMQUrl = "amqp://localhost:5672";

	beforeEach(() => {
		process.env.RABBITMQ_URL = mockRabbitMQUrl;
	});

	afterEach(() => {
		delete process.env.RABBITMQ_URL;
	});

	describe("rabbitNotificationConfig", () => {
		it("should return correct notification config", () => {
			const config = rabbitNotificationConfig();

			expect(config).toEqual({
				mainUrl: mockRabbitMQUrl,
				name: INJECTION_KEYS.RABBITMQ_NOTIFICATION_SERVER,
				transport: Transport.RMQ,
				options: {
					urls: [mockRabbitMQUrl],
					queue: RABBITMQ_QUEUE.NOTIFICATION_QUEUE,
					queueOptions: {
						durable: true,
					},
				},
			});
		});
	});

	describe("rabbitErrorNotificationConfig", () => {
		it("should return correct error notification config", () => {
			const config = rabbitErrorNotificationConfig();

			expect(config).toEqual({
				mainUrl: mockRabbitMQUrl,
				name: INJECTION_KEYS.RABBITMQ_ERROR_NOTIFICATION_SERVER,
				transport: Transport.RMQ,
				options: {
					urls: [mockRabbitMQUrl],
					queue: RABBITMQ_QUEUE.ERROR_NOTIFICATION_QUEUE,
					queueOptions: {
						durable: true,
					},
				},
			});
		});
	});

	describe("rabbitErrorConfig", () => {
		it("should return correct error config", () => {
			const config = rabbitErrorConfig();

			expect(config).toEqual({
				mainUrl: mockRabbitMQUrl,
				name: INJECTION_KEYS.RABBITMQ_ERROR_SERVER,
				transport: Transport.RMQ,
				options: {
					urls: [mockRabbitMQUrl],
					queue: RABBITMQ_QUEUE.ERROR_QUEUE,
					queueOptions: {
						durable: true,
					},
				},
			});
		});
	});
});
