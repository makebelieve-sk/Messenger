import { Redis } from "ioredis";
import { I18nService } from "nestjs-i18n";
import RedisController from "src/controllers/redis.controller";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import { PincodeDto } from "src/dto/redis.dto";
import FileLogger from "src/services/logger.service";
import NotificationService from "src/services/notification.service";
import PincodesService from "src/services/tables/pincodes.service";
import {
	INJECTION_KEYS,
	NOTIFICATION_TYPE,
	STRATEGY_ACTION,
} from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";

type MockRedis = {
	sadd: jest.Mock<Promise<number>>;
	expire: jest.Mock<Promise<number>>;
	srem: jest.Mock<Promise<number>>;
};

type MockLogger = {
	setContext: jest.Mock;
	debug: jest.Mock;
	error: jest.Mock;
	warn: jest.Mock;
};

type MockNotifier = {
	notify: jest.Mock<Promise<void>>;
};

type MockPincodes = {
	removeBy: jest.Mock<Promise<void>>;
};

type MockI18n = {
	t: jest.Mock<string>;
};

describe("RedisController", () => {
	let controller: RedisController;
	let redis: Redis;
	let logger: FileLogger;
	let pincodesService: PincodesService;

	const mockLogger: MockLogger = {
		setContext: jest.fn(),
		debug: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	};
	const mockNotifier: MockNotifier = { notify: jest.fn() };
	const mockPincodes: MockPincodes = { removeBy: jest.fn() };
	const mockI18n: MockI18n = {
		t: jest.fn().mockImplementation((key) => `translated:${key}`),
	};

	const mockRedis: MockRedis = {
		sadd: jest.fn(),
		expire: jest.fn(),
		srem: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RedisController],
			providers: [
				{ provide: INJECTION_KEYS.IOREDIS_OPTIONS, useValue: mockRedis },
				{ provide: FileLogger, useValue: mockLogger },
				{ provide: NotificationService, useValue: mockNotifier },
				{ provide: PincodesService, useValue: mockPincodes },
				{ provide: I18nService, useValue: mockI18n },
			],
		}).compile();

		controller = module.get<RedisController>(RedisController);
		redis = module.get<Redis>(INJECTION_KEYS.IOREDIS_OPTIONS);
		logger = module.get<FileLogger>(FileLogger);
		pincodesService = module.get<PincodesService>(PincodesService);
	});

	it("should set logger context on init", () => {
		expect(logger.setContext).toHaveBeenCalledWith("RedisController");
	});

	describe("handlePincodeSet", () => {
		const data: PincodeDto = { userId: "user1", pincode: 123456 };
		const key = `user:${data.userId}:pin`;

		it("should return true when new pincode added and set expire", async () => {
			mockRedis.sadd.mockResolvedValue(1);
			mockRedis.expire.mockResolvedValue(1);

			const result = await controller.handlePincodeSet(data);

			expect(logger.debug).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.handling_message"),
			);
			expect(redis.sadd).toHaveBeenCalledWith(key, data.pincode);
			expect(redis.expire).toHaveBeenCalledWith(key, expect.any(Number));
			expect(result).toBe(true);
		});

		it("should return false when pincode exists", async () => {
			mockRedis.sadd.mockResolvedValue(0);

			const result = await controller.handlePincodeSet(data);

			expect(redis.sadd).toHaveBeenCalledWith(key, data.pincode);
			expect(result).toBe(false);
		});

		it("should catch error and return false", async () => {
			mockRedis.sadd.mockRejectedValue(new Error("fail"));

			const result = await controller.handlePincodeSet(data);

			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.failed_pincode_handle"),
			);
			expect(result).toBe(false);
		});
	});

	describe("handlePincodeDelete", () => {
		const data: PincodeDto = { userId: "user2", pincode: 567890 };
		const key = `user:${data.userId}:pin`;

		it("should handle payload data correctly", async () => {
			mockRedis.srem.mockResolvedValue(1);
			mockPincodes.removeBy.mockResolvedValue(undefined);

			const result = await controller.handlePincodeDelete(data);

			expect(result).toBe(true);
			expect(redis.srem).toHaveBeenCalledWith(key, data.pincode);
			expect(pincodesService.removeBy).toHaveBeenCalledWith({
				pincode: data.pincode,
			});
		});

		it("should handle payload with invalid data", async () => {
			const invalidData = { userId: "user2" } as PincodeDto;
			mockRedis.srem.mockResolvedValue(1);

			const result = await controller.handlePincodeDelete(invalidData);

			expect(result).toBe(true);
			expect(redis.srem).toHaveBeenCalledWith(
				`user:${invalidData.userId}:pin`,
				undefined,
			);
		});

		it("should return true when pincode removed and call removeBy", async () => {
			mockRedis.srem.mockResolvedValue(1);
			mockPincodes.removeBy.mockResolvedValue(undefined);

			const result = await controller.handlePincodeDelete(data);

			expect(logger.debug).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.handling_message"),
			);
			expect(redis.srem).toHaveBeenCalledWith(key, data.pincode);
			expect(logger.debug).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.pincode_deleted"),
			);
			expect(pincodesService.removeBy).toHaveBeenCalledWith({
				pincode: data.pincode,
			});
			expect(result).toBe(true);
		});

		it("should return false when pincode not found", async () => {
			mockRedis.srem.mockResolvedValue(0);

			const result = await controller.handlePincodeDelete(data);

			expect(logger.warn).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.pincode_not_found"),
			);
			expect(result).toBe(false);
		});

		it("should catch error and return false", async () => {
			mockRedis.srem.mockRejectedValue(new Error("oops"));

			const result = await controller.handlePincodeDelete(data);

			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.failed_pincode_delete"),
			);
			expect(result).toBe(false);
		});
	});

	describe("handleFailedNotifications", () => {
		const data: NotificationQueueDto = {
			type: NOTIFICATION_TYPE.TELEGRAM,
			recipient: "FC1999C3-6CC1-4A1D-A95E-1279B141CE32",
			payload: {
				userName: "Алексей",
				avatarUrl: "https://avatars.mds.yandex.net/i",
				title: "Заявка в друзья",
				mainText: "Алексей отправил Вам заявку в друзья",
				text: "Текст сообщения",
			},
			action: STRATEGY_ACTION.NEW_NOTIFICATION,
		};

		it("should handle payload data correctly", async () => {
			await controller.handleFailedNotifications(data);

			expect(logger.debug).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.handling_message"),
			);
			expect(mockNotifier.notify).toHaveBeenCalledWith(
				data.type,
				data.recipient,
				data.payload,
				data.action,
			);
		});

		it("should handle payload with missing required fields", async () => {
			const invalidData = {
				type: NOTIFICATION_TYPE.TELEGRAM,
				// missing recipient
				payload: {},
				action: STRATEGY_ACTION.NEW_NOTIFICATION,
			} as NotificationQueueDto;

			mockNotifier.notify.mockRejectedValueOnce(new Error("Invalid data"));

			await controller.handleFailedNotifications(invalidData);

			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.failed_pincode_handle"),
			);
		});

		it("should notify on failed notifications", async () => {
			await controller.handleFailedNotifications(data);

			expect(logger.debug).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.handling_message"),
			);
			expect(mockNotifier.notify).toHaveBeenCalledWith(
				data.type,
				data.recipient,
				data.payload,
				data.action,
			);
		});

		it("should catch error without throwing", async () => {
			mockNotifier.notify.mockRejectedValueOnce(new Error("error"));

			const result = await controller.handleFailedNotifications(data);

			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("translated:redis.failed_proceed_message"),
			);
			expect(result).toBeUndefined();
		});
	});
});
