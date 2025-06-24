import { I18nService } from "nestjs-i18n";
import UsersDto from "src/dto/tables/users.dto";
import FileLogger from "src/services/logger.service";
import UsersService from "src/services/tables/users.service";
import { Repository } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("UsersService", () => {
	let service: UsersService;
	let repository: Repository<UsersDto>;
	let logger: FileLogger;
	let i18n: I18nService;

	const mockUser = {
		id: "1",
		// Add other required user properties here
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(UsersDto),
					useValue: {
						findOne: jest.fn(),
						findOneBy: jest.fn(),
					},
				},
				{
					provide: FileLogger,
					useValue: {
						setContext: jest.fn(),
						debug: jest.fn(),
					},
				},
				{
					provide: I18nService,
					useValue: {
						t: jest.fn().mockReturnValue("translated message"),
					},
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		repository = module.get<Repository<UsersDto>>(getRepositoryToken(UsersDto));
		logger = module.get<FileLogger>(FileLogger);
		i18n = module.get<I18nService>(I18nService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("findOne", () => {
		it("should call repository.findOneBy with correct id and log the action", async () => {
			const id = "1";
			jest.spyOn(repository, "findOneBy").mockResolvedValue(mockUser as UsersDto);

			const result = await service.findOne(id);

			expect(repository.findOneBy).toHaveBeenCalledWith({ id });
			expect(logger.debug).toHaveBeenCalled();
			expect(i18n.t).toHaveBeenCalledWith("notifications.users.find_one", {
				args: { id },
			});
			expect(result).toEqual(mockUser);
		});

		it("should return undefined when user is not found", async () => {
			const id = "1";
			jest.spyOn(repository, "findOne").mockResolvedValue(undefined);

			const result = await service.findOne(id);

			expect(result).toBeUndefined();
		});
	});

	describe("findOneBy", () => {
		it("should call repository.findOneBy with correct data and log the action", async () => {
			const searchData = { email: "test@example.com" };
			jest.spyOn(repository, "findOneBy").mockResolvedValue(mockUser as UsersDto);

			const result = await service.findOneBy(searchData);

			expect(repository.findOneBy).toHaveBeenCalledWith(searchData);
			expect(logger.debug).toHaveBeenCalled();
			expect(i18n.t).toHaveBeenCalledWith("notifications.users.find_one_by", {
				args: { data: JSON.stringify(searchData) },
			});
			expect(result).toEqual(mockUser);
		});
	});
});
