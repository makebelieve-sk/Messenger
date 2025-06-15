import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import StrategyError from "src/errors/strategy.error";
import FileLogger from "src/services/logger.service";
import RedisService from "src/services/redis.service";
import SMSService from "src/services/strategies/sms.service";
import PincodesService from "src/services/tables/pincodes.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import UsersService from "src/services/tables/users.service";
import { NOTIFICATION_TYPE, STRATEGY_ACTION } from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";

describe("SMSService", () => {
	let service: SMSService;

	const mockLogger = {
		log: jest.fn(),
	};

	const mockI18n = {
		t: jest.fn(),
	};

	const mockUsersService = {
		findOne: jest.fn(),
	};

	const mockRedisService = {
		// Add any required methods
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
				SMSService,
				{
					provide: FileLogger,
					useValue: mockLogger,
				},
				{
					provide: I18nService,
					useValue: mockI18n,
				},
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
				{
					provide: RedisService,
					useValue: mockRedisService,
				},
				{
					provide: SentNotificationsService,
					useValue: mockSentNotificationsService,
				},
				{
					provide: PincodesService,
					useValue: mockPincodesService,
				},
				{
					provide: TelegramUsersService,
					useValue: mockTelegramUsersService,
				},
			],
		}).compile();

		service = module.get<SMSService>(SMSService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should initialize with SMS notification type", () => {
		expect(service["strategyType"]).toBe(NOTIFICATION_TYPE.SMS);
	});

	describe("send", () => {
		const mockRecipient = "+1234567890";
		const mockPayload: PayloadNotificationDto = {
			userName: "Test User",
			avatarUrl: "https://example.com/avatar.jpg",
			title: "Test Title",
			mainText: "Test Message",
			text: "Additional information",
		};
		const mockAction = STRATEGY_ACTION.NEW_NOTIFICATION;
		const mockLogMessage = "SMS send log message";
		const mockErrorMessage = "SMS not implemented error message";

		beforeEach(() => {
			mockI18n.t.mockImplementation((key) => {
				if (key === "strategies.sms-send") {
					return mockLogMessage;
				}
				if (key === "strategies.sms-not-implemented") {
					return mockErrorMessage;
				}
				return "";
			});
		});

		it("should log the send attempt and throw StrategyError", async () => {
			await expect(
				service.send(mockRecipient, mockPayload, mockAction),
			).rejects.toThrow(StrategyError);

			expect(mockI18n.t).toHaveBeenCalledWith("strategies.sms-send", {
				args: {
					recipient: mockRecipient,
					payload: JSON.stringify(mockPayload),
					action: mockAction,
				},
			});

			expect(mockLogger.log).toHaveBeenCalledWith(mockLogMessage);
			expect(mockI18n.t).toHaveBeenCalledWith("strategies.sms-not-implemented");
		});
	});
});
