import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import AppError from "src/errors/app.error";
import NotificationStrategy from "src/interfaces/notification.interface";
import FileLogger from "src/services/logger.service";
import NotificationService from "src/services/notification.service";
import {
	INJECTION_KEYS,
	NOTIFICATION_TYPE,
	STRATEGY_ACTION,
} from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";

describe("NotificationService", () => {
	let service: NotificationService;
	let mockStrategy: jest.Mocked<NotificationStrategy>;
	let mockLogger: jest.Mocked<FileLogger>;
	let mockI18n: jest.Mocked<I18nService>;
	let mockStrategies: Record<NOTIFICATION_TYPE, NotificationStrategy>;

	beforeEach(async () => {
		mockStrategy = {
			send: jest.fn(),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;

		mockStrategies = {
			[NOTIFICATION_TYPE.EMAIL]: mockStrategy,
			[NOTIFICATION_TYPE.SMS]: mockStrategy,
			[NOTIFICATION_TYPE.TELEGRAM]: mockStrategy,
		};

		mockLogger = {
			setContext: jest.fn(),
			debug: jest.fn(),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;

		mockI18n = {
			t: jest.fn(),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NotificationService,
				{
					provide: INJECTION_KEYS.NOTIFICATION_STRATEGIES,
					useValue: mockStrategies,
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

		service = module.get<NotificationService>(NotificationService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("notify", () => {
		const recipient = "test@example.com";
		const payload: PayloadNotificationDto = {
			userName: "Test User",
			avatarUrl: "https://example.com/avatar.jpg",
			title: "Test Title",
			mainText: "Test Message",
		};
		const action = STRATEGY_ACTION.NEW_NOTIFICATION;

		it("should successfully send notification", async () => {
			mockI18n.t.mockReturnValue("Debug message");
			mockStrategy.send.mockResolvedValue(undefined);

			await service.notify(NOTIFICATION_TYPE.EMAIL, recipient, payload, action);

			expect(mockLogger.debug).toHaveBeenCalledWith("Debug message");
			expect(mockStrategy.send).toHaveBeenCalledWith(recipient, payload, action);
		});

		it("should throw AppError for unknown notification type", async () => {
			const unknownType = "UNKNOWN_TYPE" as NOTIFICATION_TYPE;
			const errorMessage = "Unknown notification type";
			mockI18n.t.mockReturnValue(errorMessage);

			await expect(
				service.notify(unknownType, recipient, payload, action),
			).rejects.toThrow(new AppError(errorMessage));

			expect(mockLogger.debug).toHaveBeenCalled();
			expect(mockStrategy.send).not.toHaveBeenCalled();
		});
	});
});
