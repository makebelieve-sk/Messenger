import { I18nService } from "nestjs-i18n";
import GracefulShutdownService from "src/services/graceful-shutdown.service";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import RedisService from "src/services/redis.service";
import { RABBITMQ_QUEUE, RabbitMQ_SEND_TYPE } from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";

describe("GracefulShutdownService", () => {
	let service: GracefulShutdownService;
	let logger: jest.Mocked<FileLogger>;
	let rabbitMQService: jest.Mocked<RabbitMQService>;
	let redis: jest.Mocked<RedisService>;
	let i18n: jest.Mocked<I18nService>;

	beforeEach(async () => {
		// Create mock implementations
		logger = {
			setContext: jest.fn(),
			warn: jest.fn(),
			close: jest.fn(),
			log: jest.fn(),
			error: jest.fn(),
			debug: jest.fn(),
			verbose: jest.fn(),
			isLevelEnabled: jest.fn(),
		} as unknown as jest.Mocked<FileLogger>;

		rabbitMQService = {
			sendErrorMessage: jest.fn(),
			close: jest.fn().mockResolvedValue(undefined),
			onModuleInit: jest.fn().mockResolvedValue(undefined),
			sendNotificationMessage: jest.fn(),
			sendErrorNotificationMessage: jest.fn(),
		} as unknown as jest.Mocked<RabbitMQService>;

		redis = {
			close: jest.fn().mockResolvedValue(undefined),
			onModuleInit: jest.fn().mockResolvedValue(undefined),
			sendHeartbeat: jest.fn().mockResolvedValue(undefined),
			publish: jest.fn(),
			publishWithAck: jest.fn(),
		} as unknown as jest.Mocked<RedisService>;

		i18n = {
			t: jest
				.fn()
				.mockImplementation(
					(key: string, options?: { args: Record<string, unknown> }) => {
						if (key === "global.graceful_shutdown.signal_received") {
							return `Signal received: ${options?.args.signal}`;
						}
						if (key === "global.graceful_shutdown.error_message.at") {
							return "Error occurred at";
						}
						return key;
					},
				),
			onModuleDestroy: jest.fn(),
			translate: jest.fn(),
			getSupportedLanguages: jest.fn(),
			getTranslations: jest.fn(),
			validate: jest.fn(),
		} as unknown as jest.Mocked<I18nService>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GracefulShutdownService,
				{ provide: FileLogger, useValue: logger },
				{ provide: RabbitMQService, useValue: rabbitMQService },
				{ provide: RedisService, useValue: redis },
				{ provide: I18nService, useValue: i18n },
			],
		}).compile();

		service = module.get<GracefulShutdownService>(GracefulShutdownService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should set logger context on initialization", () => {
		expect(logger.setContext).toHaveBeenCalledWith("GracefulShutdownService");
	});

	describe("onApplicationShutdown", () => {
		it("should handle shutdown with signal", async () => {
			const signal = "SIGTERM";
			const mockDate = new Date("2024-01-01T00:00:00.000Z");
			jest.useFakeTimers().setSystemTime(mockDate);

			await service.onApplicationShutdown(signal);

			// Verify logging
			expect(logger.warn).toHaveBeenCalledWith("Signal received: SIGTERM");

			// Verify error message sending
			expect(rabbitMQService.sendErrorMessage).toHaveBeenCalledWith(
				RABBITMQ_QUEUE.ERROR_QUEUE,
				{
					type: RabbitMQ_SEND_TYPE.APP_ERROR,
					reason: signal,
					at: `Error occurred at: ${mockDate.toISOString()}`,
				},
			);

			// Verify connection closures
			expect(rabbitMQService.close).toHaveBeenCalled();
			expect(redis.close).toHaveBeenCalled();
			expect(logger.close).toHaveBeenCalled();

			jest.useRealTimers();
		});

		it("should handle shutdown without signal", async () => {
			await service.onApplicationShutdown();

			// Verify logging
			expect(logger.warn).toHaveBeenCalledWith("Signal received: undefined");

			// Verify error message sending
			expect(rabbitMQService.sendErrorMessage).toHaveBeenCalledWith(
				RABBITMQ_QUEUE.ERROR_QUEUE,
				{
					type: RabbitMQ_SEND_TYPE.APP_ERROR,
					reason: undefined,
					at: expect.stringContaining("Error occurred at:"),
				},
			);

			// Verify connection closures
			expect(rabbitMQService.close).toHaveBeenCalled();
			expect(redis.close).toHaveBeenCalled();
			expect(logger.close).toHaveBeenCalled();
		});

		it("should handle errors during shutdown gracefully", async () => {
			// Simulate error during RabbitMQ close
			const error = new Error("RabbitMQ close error");
			jest.spyOn(rabbitMQService, "close").mockRejectedValueOnce(error);

			try {
				await service.onApplicationShutdown("SIGTERM");
			} catch (err) {
				expect(err).toBe(error);
			}

			// Verify that error message was sent before the error
			expect(rabbitMQService.sendErrorMessage).toHaveBeenCalledWith(
				RABBITMQ_QUEUE.ERROR_QUEUE,
				{
					type: RabbitMQ_SEND_TYPE.APP_ERROR,
					reason: "SIGTERM",
					at: expect.stringContaining("Error occurred at:"),
				},
			);
		});
	});
});
