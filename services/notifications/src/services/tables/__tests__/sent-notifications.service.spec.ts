import { I18nService } from "nestjs-i18n";
import SentNotificationsDto from "src/dto/tables/sent-notifications.dto";
import FileLogger from "src/services/logger.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import { NOTIFICATION_TYPE } from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("SentNotificationsService", () => {
	let service: SentNotificationsService;

	const mockRepository = {
		create: jest.fn(),
		save: jest.fn(),
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
				SentNotificationsService,
				{
					provide: getRepositoryToken(SentNotificationsDto),
					useValue: mockRepository,
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

		service = module.get<SentNotificationsService>(SentNotificationsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should set logger context on initialization", () => {
		expect(mockLogger.setContext).toHaveBeenCalledWith(
			"SentNotificationsService",
		);
	});

	describe("create", () => {
		const mockData = {
			userId: 1,
			recipientId: "2",
			type: NOTIFICATION_TYPE.EMAIL,
			message: "Test notification",
			payload: "test data",
			action: "TEST_ACTION",
			success: true,
		};

		const mockCreatedNotification = {
			id: 1,
			...mockData,
			createdAt: new Date(),
		};

		beforeEach(() => {
			mockRepository.create.mockReturnValue(mockCreatedNotification);
			mockRepository.save.mockResolvedValue(mockCreatedNotification);
		});

		it("should create a new notification", async () => {
			const result = await service.create(mockData);

			expect(mockI18n.t).toHaveBeenCalledWith(
				"notifications.sent_notifications.create",
			);
			expect(mockLogger.debug).toHaveBeenCalledWith("translated message");
			expect(mockRepository.create).toHaveBeenCalledWith(mockData);
			expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedNotification);
			expect(result).toEqual(mockCreatedNotification);
		});
	});
});
