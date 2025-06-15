import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import StrategyError from "src/errors/strategy.error";
import FileLogger from "src/services/logger.service";
import NodeTelegramService from "src/services/node-telegram.service";
import NodemailerService from "src/services/nodemailer.service";
import RedisService from "src/services/redis.service";
import TelegramService from "src/services/strategies/telegram.service";
import PincodesService from "src/services/tables/pincodes.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import UsersService from "src/services/tables/users.service";
import { STRATEGY_ACTION } from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";

// Расширяем тип TelegramService, чтобы включить protected методы
type TelegramServiceWithProtected = TelegramService & {
	getField: () => Promise<{ telegramId: number }>;
	getPincode: () => Promise<number>;
	updateDatabase: () => Promise<void>;
};

describe("TelegramService", () => {
	let service: TelegramServiceWithProtected;
	let baseService: {
		getField: jest.Mock;
		getPincode: jest.Mock;
		updateDatabase: jest.Mock;
	};

	const mockI18n = {
		t: jest.fn((key) => key),
	};

	const mockNodeTelegramService = {
		notifyUser: jest.fn(),
	};

	const mockNodemailerService = {
		supportMail: "support@example.com",
	};

	const mockLogger = {
		log: jest.fn(),
	};

	const mockSentNotificationsService = {
		create: jest.fn(),
	};

	const mockPincodesService = {
		create: jest.fn(),
	};

	const mockUsersService = {
		getField: jest.fn(),
	};

	const mockRedisService = {
		get: jest.fn(),
	};

	const mockTelegramUsersService = {
		getField: jest.fn(),
		findOneBy: jest.fn(),
	};

	const defaultPayload: PayloadNotificationDto = {
		userName: "Test User",
		avatarUrl: "https://example.com/avatar.jpg",
		title: "Test Title",
		mainText: "Test Main Text",
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TelegramService,
				{ provide: NodeTelegramService, useValue: mockNodeTelegramService },
				{ provide: NodemailerService, useValue: mockNodemailerService },
				{ provide: FileLogger, useValue: mockLogger },
				{ provide: I18nService, useValue: mockI18n },
				{
					provide: SentNotificationsService,
					useValue: mockSentNotificationsService,
				},
				{ provide: PincodesService, useValue: mockPincodesService },
				{ provide: UsersService, useValue: mockUsersService },
				{ provide: RedisService, useValue: mockRedisService },
				{ provide: TelegramUsersService, useValue: mockTelegramUsersService },
			],
		}).compile();

		service = module.get<TelegramService>(
			TelegramService,
		) as TelegramServiceWithProtected;

		// Setup base service mocks
		baseService = {
			getField: jest.fn().mockResolvedValue({ telegramId: 123456789 }),
			getPincode: jest.fn().mockResolvedValue(123456),
			updateDatabase: jest.fn(),
		};

		// Mock the protected methods
		jest.spyOn(service, "getField").mockImplementation(baseService.getField);
		jest.spyOn(service, "getPincode").mockImplementation(baseService.getPincode);
		jest
			.spyOn(service, "updateDatabase")
			.mockImplementation(baseService.updateDatabase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("send", () => {
		const recipient = "test@example.com";
		const telegramId = 123456789;

		it("should send login notification", async () => {
			mockTelegramUsersService.findOneBy.mockResolvedValue({ telegramId });

			await service.send(recipient, defaultPayload, STRATEGY_ACTION.LOGIN);

			expect(mockNodeTelegramService.notifyUser).toHaveBeenCalledWith(
				telegramId,
				expect.stringContaining("security_notification"),
				{ parse_mode: "HTML" },
			);
			expect(mockSentNotificationsService.create).toHaveBeenCalled();
		});

		it("should send new notification", async () => {
			mockTelegramUsersService.findOneBy.mockResolvedValue({ telegramId });
			const payload: PayloadNotificationDto = {
				...defaultPayload,
				text: "Test Additional Text",
			};

			await service.send(recipient, payload, STRATEGY_ACTION.NEW_NOTIFICATION);

			expect(mockNodeTelegramService.notifyUser).toHaveBeenCalledWith(
				telegramId,
				expect.stringContaining("Test Title"),
				{ parse_mode: "HTML" },
			);
			expect(mockSentNotificationsService.create).toHaveBeenCalled();
		});

		it("should handle missing telegram ID", async () => {
			mockTelegramUsersService.findOneBy.mockResolvedValue(null);

			await expect(
				service.send(recipient, defaultPayload, STRATEGY_ACTION.LOGIN),
			).rejects.toThrow();
		});

		it("should handle pincode generation error", async () => {
			mockTelegramUsersService.findOneBy.mockResolvedValue({ telegramId });
			baseService.getPincode.mockRejectedValue(
				new StrategyError("Pin generation failed"),
			);

			await expect(
				service.send(recipient, defaultPayload, STRATEGY_ACTION.PINCODE),
			).rejects.toThrow(StrategyError);
		});
	});
});
