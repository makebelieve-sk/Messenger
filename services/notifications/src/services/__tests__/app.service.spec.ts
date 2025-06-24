import { I18nService } from "nestjs-i18n";
import AppService from "src/services/app.service";
import FileLogger from "src/services/logger.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("AppService", () => {
	let service: AppService;

	const mockLogger = {
		setContext: jest.fn(),
		debug: jest.fn(),
	};

	const mockI18n = {
		t: jest.fn().mockReturnValue("Health check message"),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AppService,
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

		service = module.get<AppService>(AppService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should set context on initialization", () => {
		expect(mockLogger.setContext).toHaveBeenCalledWith("AppService");
	});

	describe("healthcheck", () => {
		it("should call logger.debug with i18n message", () => {
			service.healthcheck();

			expect(mockI18n.t).toHaveBeenCalledWith("http.healthcheck");
			expect(mockLogger.debug).toHaveBeenCalledWith("Health check message");
		});

		it("should return true", () => {
			const result = service.healthcheck();
			expect(result).toBe(true);
		});
	});
});
