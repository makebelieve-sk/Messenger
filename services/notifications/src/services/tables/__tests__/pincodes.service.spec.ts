import { I18nService } from "nestjs-i18n";
import PincodesDto from "src/dto/tables/pincodes.dto";
import FileLogger from "src/services/logger.service";
import PincodesService from "src/services/tables/pincodes.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("PincodesService", () => {
	let service: PincodesService;
	let logger: FileLogger;
	let i18n: I18nService;

	const mockPincode = {
		id: 1,
		userId: "user123",
		pincode: 123456,
		expiresAt: new Date(),
		createdAt: new Date(),
		attempts: 0,
	};

	const mockRepository = {
		create: jest.fn(),
		save: jest.fn(),
		findOneBy: jest.fn(),
		delete: jest.fn(),
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
				PincodesService,
				{
					provide: getRepositoryToken(PincodesDto),
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

		service = module.get<PincodesService>(PincodesService);
		logger = module.get<FileLogger>(FileLogger);
		i18n = module.get<I18nService>(I18nService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("create", () => {
		it("should create a new pincode", async () => {
			const createData = {
				userId: "user123",
				pincode: 123456,
				expiresAt: new Date(),
				attempts: 0,
			};
			mockRepository.create.mockReturnValue(mockPincode);
			mockRepository.save.mockResolvedValue(mockPincode);

			const result = await service.create(createData);

			expect(mockRepository.create).toHaveBeenCalledWith(createData);
			expect(mockRepository.save).toHaveBeenCalledWith(mockPincode);
			expect(logger.debug).toHaveBeenCalled();
			expect(i18n.t).toHaveBeenCalledWith("notifications.pincodes.create");
			expect(result).toEqual(mockPincode);
		});
	});

	describe("remove", () => {
		it("should remove a pincode by id", async () => {
			mockRepository.delete.mockResolvedValue({ affected: 1 });

			await service.remove(1);

			expect(mockRepository.delete).toHaveBeenCalledWith(1);
			expect(logger.debug).toHaveBeenCalled();
			expect(i18n.t).toHaveBeenCalledWith("notifications.pincodes.remove", {
				args: { id: 1 },
			});
		});
	});

	describe("removeBy", () => {
		it("should remove a pincode by criteria", async () => {
			const criteria = { pincode: 123456 };
			mockRepository.findOneBy.mockResolvedValue(mockPincode);
			mockRepository.delete.mockResolvedValue({ affected: 1 });

			await service.removeBy(criteria);

			expect(mockRepository.findOneBy).toHaveBeenCalledWith(criteria);
			expect(mockRepository.delete).toHaveBeenCalledWith(mockPincode.id);
			expect(logger.debug).toHaveBeenCalled();
			expect(i18n.t).toHaveBeenCalledWith("notifications.pincodes.remove_by", {
				args: { data: JSON.stringify(criteria) },
			});
		});

		it("should throw error if pincode not found", async () => {
			const criteria = { pincode: 999999 };
			mockRepository.findOneBy.mockResolvedValue(null);

			await expect(service.removeBy(criteria)).rejects.toThrow();
		});
	});
});
