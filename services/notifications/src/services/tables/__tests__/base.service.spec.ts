import { I18nService } from "nestjs-i18n";
import TelegramUsersDto from "src/dto/tables/telegram-users.dto";
import DatabaseError from "src/errors/database.error";
import FileLogger from "src/services/logger.service";
import BaseRepositoryService from "src/services/tables/base.service";
import { Repository } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";

// Mock DTO for testing that implements required properties from DtoType
class TestDto implements TelegramUsersDto {
	id: number;
	firstName: string;
	lastName: string;
	userName: string;
	telegramId: number;
	userId: string;
}

// Concrete implementation for testing
class TestRepositoryService extends BaseRepositoryService<TestDto> {
	constructor(repository: Repository<TestDto>) {
		super(repository);
	}
}

describe("BaseRepositoryService", () => {
	let service: TestRepositoryService;
	let repository: Repository<TestDto>;
	let i18nService: I18nService;

	const mockTestDto: TestDto = {
		id: 1,
		firstName: "Test",
		lastName: "Test",
		userName: "testuser",
		telegramId: 123456789,
		userId: "user-123",
	};

	beforeEach(async () => {
		const mockRepository = {
			find: jest.fn(),
			findOneBy: jest.fn(),
			create: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		const mockI18nService = {
			t: jest.fn().mockReturnValue("Entity not found"),
		};

		const mockLogger = {
			error: jest.fn(),
			info: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TestRepositoryService,
				{
					provide: Repository,
					useValue: mockRepository,
				},
				{
					provide: I18nService,
					useValue: mockI18nService,
				},
				{
					provide: FileLogger,
					useValue: mockLogger,
				},
			],
		}).compile();

		service = module.get<TestRepositoryService>(TestRepositoryService);
		repository = module.get<Repository<TestDto>>(Repository);
		i18nService = module.get<I18nService>(I18nService);
	});

	describe("findAll", () => {
		it("should return an array of entities", async () => {
			const expectedResult = [mockTestDto];
			jest.spyOn(repository, "find").mockResolvedValue(expectedResult);

			const result = await service["findAll"]();
			expect(result).toEqual(expectedResult);
			expect(repository.find).toHaveBeenCalled();
		});
	});

	describe("findOne", () => {
		it("should return an entity by id", async () => {
			jest.spyOn(repository, "findOneBy").mockResolvedValue(mockTestDto);

			const result = await service["findOne"](1);
			expect(result).toEqual(mockTestDto);
			expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
		});

		it("should return null when entity not found", async () => {
			jest.spyOn(repository, "findOneBy").mockResolvedValue(null);

			const result = await service["findOne"](1);
			expect(result).toBeNull();
		});
	});

	describe("findOneBy", () => {
		it("should return an entity by criteria", async () => {
			jest.spyOn(repository, "findOneBy").mockResolvedValue(mockTestDto);

			const result = await service["findOneBy"]({ firstName: "Test" });
			expect(result).toEqual(mockTestDto);
			expect(repository.findOneBy).toHaveBeenCalledWith({ firstName: "Test" });
		});

		it("should throw DatabaseError when entity not found", async () => {
			jest.spyOn(repository, "findOneBy").mockResolvedValue(null);

			await expect(service["findOneBy"]({ firstName: "Test" })).rejects.toThrow(
				DatabaseError,
			);
			expect(i18nService.t).toHaveBeenCalled();
		});
	});

	describe("create", () => {
		it("should create and save a new entity", async () => {
			const newEntity = {
				firstName: "New Test",
				lastName: "Test",
				userName: "newuser",
				telegramId: 987654321,
				userId: "user-456",
			};
			const createdEntity = { ...newEntity, id: 1 };

			jest.spyOn(repository, "create").mockReturnValue(createdEntity);
			jest.spyOn(repository, "save").mockResolvedValue(createdEntity);

			const result = await service["create"](newEntity);
			expect(result).toEqual(createdEntity);
			expect(repository.create).toHaveBeenCalledWith(newEntity);
			expect(repository.save).toHaveBeenCalledWith(createdEntity);
		});
	});

	describe("update", () => {
		it("should update an existing entity", async () => {
			const updateData = {
				firstName: "Updated Test",
				lastName: "Test",
				userName: "updateduser",
				telegramId: 111222333,
				userId: "user-789",
			};
			const updatedEntity = { ...mockTestDto, ...updateData };

			jest.spyOn(repository, "findOneBy").mockResolvedValue(mockTestDto);
			jest.spyOn(repository, "save").mockResolvedValue(updatedEntity);

			const result = await service["update"](1, updateData);
			expect(result).toEqual(updatedEntity);
			expect(repository.save).toHaveBeenCalledWith(updatedEntity);
		});

		it("should throw DatabaseError when entity not found", async () => {
			jest.spyOn(repository, "findOneBy").mockResolvedValue(null);

			await expect(service["update"](1, { firstName: "Updated" })).rejects.toThrow(
				DatabaseError,
			);
			expect(i18nService.t).toHaveBeenCalled();
		});
	});

	describe("remove", () => {
		it("should remove an entity", async () => {
			jest.spyOn(repository, "delete").mockResolvedValue({ affected: 1, raw: [] });

			await service["remove"](1);
			expect(repository.delete).toHaveBeenCalledWith(1);
		});
	});
});
