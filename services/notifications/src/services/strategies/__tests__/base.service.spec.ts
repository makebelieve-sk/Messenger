import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import StrategyError from "src/errors/strategy.error";
import RedisService from "src/services/redis.service";
import BaseStrategyService from "src/services/strategies/base.service";
import PincodesService from "src/services/tables/pincodes.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import UsersService from "src/services/tables/users.service";
import {
	NOTIFICATION_TYPE,
	REDIS_CHANNEL,
	STRATEGY_ACTION,
} from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";

// Mock implementation of BaseStrategyService for testing
class TestStrategyService extends BaseStrategyService {
	constructor() {
		super(NOTIFICATION_TYPE.EMAIL);
	}
}

describe("BaseStrategyService", () => {
	let service: TestStrategyService;
	let usersService: UsersService;
	let redisService: RedisService;
	let sentNotificationsService: SentNotificationsService;
	let pincodesService: PincodesService;
	let telegramUsersService: TelegramUsersService;

	const mockI18n = {
		t: jest.fn().mockImplementation((key) => key),
	};

	const mockUsersService = {
		findOne: jest.fn(),
	};

	const mockRedisService = {
		publishWithAck: jest.fn(),
	};

	const mockSentNotificationsService = {
		create: jest.fn(),
	};

	const mockPincodesService = {
		create: jest.fn(),
	};

	const mockTelegramUsersService = {
		findOneBy: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TestStrategyService,
				{ provide: I18nService, useValue: mockI18n },
				{ provide: UsersService, useValue: mockUsersService },
				{ provide: RedisService, useValue: mockRedisService },
				{
					provide: SentNotificationsService,
					useValue: mockSentNotificationsService,
				},
				{ provide: PincodesService, useValue: mockPincodesService },
				{ provide: TelegramUsersService, useValue: mockTelegramUsersService },
			],
		}).compile();

		service = module.get<TestStrategyService>(TestStrategyService);
		usersService = module.get<UsersService>(UsersService);
		redisService = module.get<RedisService>(RedisService);
		sentNotificationsService = module.get<SentNotificationsService>(
			SentNotificationsService,
		);
		pincodesService = module.get<PincodesService>(PincodesService);
		telegramUsersService = module.get<TelegramUsersService>(TelegramUsersService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("updateDatabase", () => {
		const mockRecipient = "user123";
		const mockPayload: PayloadNotificationDto = {
			userName: "Test User",
			avatarUrl: "https://example.com/avatar.jpg",
			title: "Test Title",
			mainText: "Test Message",
			text: "Additional information",
		};
		const mockPincode = 123456;

		it("should create sent notification record", async () => {
			await service["updateDatabase"](
				mockRecipient,
				mockPayload,
				STRATEGY_ACTION.PINCODE,
				mockPincode,
			);

			expect(sentNotificationsService.create).toHaveBeenCalledWith({
				recipientId: mockRecipient,
				type: NOTIFICATION_TYPE.EMAIL,
				payload: JSON.stringify(mockPayload),
				action: STRATEGY_ACTION.PINCODE,
				success: true,
			});
		});

		it("should create pincode record when action is PINCODE", async () => {
			await service["updateDatabase"](
				mockRecipient,
				mockPayload,
				STRATEGY_ACTION.PINCODE,
				mockPincode,
			);

			expect(pincodesService.create).toHaveBeenCalledWith({
				userId: mockRecipient,
				pincode: mockPincode,
				expiresAt: expect.any(Date),
				attempts: 0,
			});
		});

		it("should not create pincode record when action is not PINCODE", async () => {
			await service["updateDatabase"](
				mockRecipient,
				mockPayload,
				STRATEGY_ACTION.NEW_NOTIFICATION,
				mockPincode,
			);

			expect(pincodesService.create).not.toHaveBeenCalled();
		});
	});

	describe("getField", () => {
		const mockUserId = "user123";

		describe("EMAIL strategy", () => {
			it("should return email when user exists", async () => {
				const mockEmail = "test@example.com";
				mockUsersService.findOne.mockResolvedValue({ email: mockEmail });

				const result = await service["getField"](mockUserId);

				expect(result).toBe(mockEmail);
				expect(usersService.findOne).toHaveBeenCalledWith(mockUserId);
			});

			it("should throw error when user not found", async () => {
				mockUsersService.findOne.mockResolvedValue(null);

				await expect(service["getField"](mockUserId)).rejects.toThrow(
					StrategyError,
				);
				expect(mockI18n.t).toHaveBeenCalledWith("strategies.email_not_found");
			});

			it("should throw error when user has no email", async () => {
				mockUsersService.findOne.mockResolvedValue({ email: null });

				await expect(service["getField"](mockUserId)).rejects.toThrow(
					StrategyError,
				);
				expect(mockI18n.t).toHaveBeenCalledWith("strategies.email_not_found");
			});
		});

		describe("TELEGRAM strategy", () => {
			beforeEach(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(service as any).strategyType = NOTIFICATION_TYPE.TELEGRAM;
			});

			it("should return telegramId when user exists", async () => {
				const mockTelegramId = 123456;
				mockTelegramUsersService.findOneBy.mockResolvedValue({
					telegramId: mockTelegramId,
				});

				const result = await service["getField"](mockUserId);

				expect(result).toBe(mockTelegramId);
				expect(telegramUsersService.findOneBy).toHaveBeenCalledWith({
					userId: mockUserId,
				});
			});

			it("should throw error when telegram user not found", async () => {
				mockTelegramUsersService.findOneBy.mockResolvedValue(null);

				await expect(service["getField"](mockUserId)).rejects.toThrow(
					StrategyError,
				);
				expect(mockI18n.t).toHaveBeenCalledWith("strategies.telegram_id_not_found");
			});
		});

		describe("SMS strategy", () => {
			beforeEach(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(service as any).strategyType = NOTIFICATION_TYPE.SMS;
			});

			it("should throw not implemented error", async () => {
				await expect(service["getField"](mockUserId)).rejects.toThrow(
					StrategyError,
				);
				expect(mockI18n.t).toHaveBeenCalledWith("strategies.not_implemented");
			});
		});
	});

	describe("getPincode", () => {
		const mockUserId = "user123";

		it("should return pincode when redis ack is successful", async () => {
			mockRedisService.publishWithAck.mockResolvedValueOnce(true);

			const result = await service["getPincode"](mockUserId);

			expect(result).toBeDefined();
			expect(result.toString().length).not.toBe(0);
			expect(redisService.publishWithAck).toHaveBeenCalledWith(
				REDIS_CHANNEL.PINCODE_SET,
				{
					userId: mockUserId,
					pincode: expect.any(Number),
				},
			);
		});

		it("should retry when redis ack fails", async () => {
			mockRedisService.publishWithAck
				.mockResolvedValueOnce(false)
				.mockResolvedValueOnce(false)
				.mockResolvedValueOnce(true);

			const result = await service["getPincode"](mockUserId);

			expect(result).toBeDefined();
			expect(result.toString().length).not.toBe(0);
			expect(redisService.publishWithAck).toHaveBeenCalledTimes(3);
		});

		it("should throw error when all attempts fail", async () => {
			mockRedisService.publishWithAck.mockResolvedValue(false);

			await expect(service["getPincode"](mockUserId)).rejects.toThrow(
				StrategyError,
			);
			expect(mockI18n.t).toHaveBeenCalledWith("strategies.pin_generation_failed");
			expect(redisService.publishWithAck).toHaveBeenCalledTimes(10);
		});

		it("should throw error when redis service throws", async () => {
			const mockError = new Error("Redis error");
			mockRedisService.publishWithAck.mockRejectedValue(mockError);

			await expect(service["getPincode"](mockUserId)).rejects.toThrow(
				StrategyError,
			);
			expect(mockI18n.t).toHaveBeenCalledWith("strategies.pin_generation_failed", {
				args: {
					attempts: 10,
					error: ": Redis error",
				},
			});
		});
	});
});
