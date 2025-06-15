import { I18nService } from "nestjs-i18n";
import TelegramUsersDto from "src/dto/tables/telegram-users.dto";
import FileLogger from "src/services/logger.service";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("TelegramUsersService", () => {
	let service: TelegramUsersService;

	const mockRepository = {
		create: jest.fn(),
		findOneBy: jest.fn(),
		save: jest.fn(),
	};

	const mockLogger = {
		setContext: jest.fn(),
		debug: jest.fn(),
	};

	const mockI18n = {
		t: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TelegramUsersService,
				{
					provide: getRepositoryToken(TelegramUsersDto),
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

		service = module.get<TelegramUsersService>(TelegramUsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should set context in constructor", () => {
		expect(mockLogger.setContext).toHaveBeenCalledWith("TelegramUsersService");
	});

	describe("create", () => {
		it("should log debug message and call repository create", async () => {
			const mockData = {
				firstName: "John",
				lastName: "Doe",
				userName: "johndoe",
				telegramId: 123,
				userId: "user123",
			};
			const mockEntity = { ...mockData };
			const mockResult = { id: 1, ...mockData };

			mockI18n.t.mockReturnValue("Creating telegram user");
			mockRepository.create.mockReturnValue(mockEntity);
			mockRepository.save.mockResolvedValue(mockResult);

			const result = await service.create(mockData);

			expect(mockI18n.t).toHaveBeenCalledWith(
				"notifications.telegram_users.create",
			);
			expect(mockLogger.debug).toHaveBeenCalledWith("Creating telegram user");
			expect(mockRepository.create).toHaveBeenCalledWith(mockData);
			expect(mockRepository.save).toHaveBeenCalledWith(mockEntity);
			expect(result).toEqual(mockResult);
		});
	});

	describe("findOneBy", () => {
		it("should log debug message and call repository findOneBy", async () => {
			const mockData = { telegramId: 123 };
			const mockResult = {
				id: 1,
				firstName: "John",
				lastName: "Doe",
				userName: "johndoe",
				telegramId: 123,
				userId: "user123",
			};

			mockI18n.t.mockReturnValue("Finding user");
			mockRepository.findOneBy.mockResolvedValue(mockResult);

			const result = await service.findOneBy(mockData);

			expect(mockI18n.t).toHaveBeenCalledWith("notifications.users.find_one_by", {
				args: { data: JSON.stringify(mockData) },
			});
			expect(mockLogger.debug).toHaveBeenCalledWith("Finding user");
			expect(mockRepository.findOneBy).toHaveBeenCalledWith(mockData);
			expect(result).toEqual(mockResult);
		});
	});
});
