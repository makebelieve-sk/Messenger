import { I18nService } from "nestjs-i18n";
import { of } from "rxjs";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import { PincodeDto } from "src/dto/redis.dto";
import FileLogger from "src/services/logger.service";
import RedisService from "src/services/redis.service";
import {
	INJECTION_KEYS,
	NOTIFICATION_TYPE,
	REDIS_CHANNEL,
	STRATEGY_ACTION,
} from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";

describe("RedisService", () => {
	let service: RedisService;

	const mockRedisClient = {
		connect: jest.fn(),
		emit: jest.fn(),
		send: jest.fn(),
		close: jest.fn(),
	};

	const mockLogger = {
		setContext: jest.fn(),
		debug: jest.fn(),
	};

	const mockI18n = {
		t: jest.fn().mockReturnValue("translated message"),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RedisService,
				{
					provide: INJECTION_KEYS.REDIS_SERVER,
					useValue: mockRedisClient,
				},
				{
					provide: FileLogger,
					useValue: mockLogger,
				},
				{
					provide: I18nService,
					useValue: mockI18n,
				},
			],
		}).compile();

		service = module.get<RedisService>(RedisService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("onModuleInit", () => {
		it("should connect to Redis server", async () => {
			await service.onModuleInit();
			expect(mockRedisClient.connect).toHaveBeenCalled();
		});
	});

	describe("sendHeartbeat", () => {
		it("should emit heartbeat message to Redis", async () => {
			jest.useFakeTimers();
			const currentTime = new Date("2024-01-01T00:00:00Z");
			jest.setSystemTime(currentTime);

			await service.sendHeartbeat();

			expect(mockRedisClient.emit).toHaveBeenCalledWith(
				REDIS_CHANNEL.HEARTBEAT,
				JSON.stringify({
					timestamp: currentTime.getTime(),
					status: "OK",
				}),
			);

			expect(mockLogger.debug).toHaveBeenCalled();
			jest.useRealTimers();
		});
	});

	describe("publish", () => {
		it("should publish message to specified channel", () => {
			const testData: NotificationQueueDto = {
				type: NOTIFICATION_TYPE.EMAIL,
				recipient: "test@example.com",
				action: STRATEGY_ACTION.NEW_NOTIFICATION,
				payload: {
					userName: "Test User",
					avatarUrl: "https://example.com/avatar.jpg",
					title: "Test Title",
					mainText: "Test Message",
				},
			};

			service.publish(REDIS_CHANNEL.FAILED_NOTIFICATIONS, testData);

			expect(mockRedisClient.emit).toHaveBeenCalledWith(
				REDIS_CHANNEL.FAILED_NOTIFICATIONS,
				JSON.stringify(testData),
			);
			expect(mockLogger.debug).toHaveBeenCalled();
		});
	});

	describe("publishWithAck", () => {
		it("should publish message and return ack", async () => {
			const testData: PincodeDto = {
				userId: "123",
				pincode: 123456,
			};

			mockRedisClient.send.mockReturnValue(of(true));

			const result = await service.publishWithAck(
				REDIS_CHANNEL.PINCODE_SET,
				testData,
			);

			expect(mockRedisClient.send).toHaveBeenCalledWith(
				REDIS_CHANNEL.PINCODE_SET,
				testData,
			);
			expect(mockLogger.debug).toHaveBeenCalled();
			expect(result).toBe(true);
		});
	});

	describe("close", () => {
		it("should close Redis connection", async () => {
			await service.close();

			expect(mockRedisClient.close).toHaveBeenCalled();
			expect(mockLogger.debug).toHaveBeenCalled();
		});
	});
});
