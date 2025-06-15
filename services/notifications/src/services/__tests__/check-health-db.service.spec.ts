import { I18nService } from "nestjs-i18n";
import CheckHealthDatabaseService from "src/services/check-health-db.service";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import PincodesService from "src/services/tables/pincodes.service";
import { RABBITMQ_QUEUE, RabbitMQ_SEND_TYPE } from "src/types/enums";
import { DataSource } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";

describe("CheckHealthDatabaseService", () => {
	let service: CheckHealthDatabaseService;
	let mockQuery: jest.Mock;

	const mockDataSource: Partial<DataSource> = {
		manager: {
			query: jest.fn(),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any,
	};

	const mockPincodesService = {
		getAll: jest.fn().mockResolvedValue([]),
	};

	const mockRabbitMQService = {
		sendErrorMessage: jest.fn(),
	};

	const mockLogger = {
		setContext: jest.fn(),
		log: jest.fn(),
		error: jest.fn(),
	};

	const mockI18nService = {
		t: jest.fn(),
	};

	beforeEach(async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockQuery = (mockDataSource.manager as any).query as jest.Mock;

		// default translation for ping
		mockI18nService.t.mockImplementation((key: string) => {
			if (key === "database.ping_database") return "Pinging database";
			return key;
		});

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CheckHealthDatabaseService,
				{ provide: DataSource, useValue: mockDataSource },
				{ provide: PincodesService, useValue: mockPincodesService },
				{ provide: RabbitMQService, useValue: mockRabbitMQService },
				{ provide: FileLogger, useValue: mockLogger },
				{ provide: I18nService, useValue: mockI18nService },
			],
		}).compile();

		service = module.get<CheckHealthDatabaseService>(CheckHealthDatabaseService);
	});

	afterEach(() => jest.clearAllMocks());

	it("should be defined", () => expect(service).toBeDefined());

	describe("pingDb", () => {
		it("should successfully ping the database", async () => {
			mockQuery.mockResolvedValueOnce([{ "1": 1 }]);

			await service.pingDb();

			expect(mockLogger.error).toHaveBeenCalled();
			expect(mockRabbitMQService.sendErrorMessage).toHaveBeenCalled();
		});

		it("should handle database connection error", async () => {
			const errorMessage = "Connection failed";
			const translatedErrorKey = "database.errors.connection_failed";
			const translatedMessage = "Database connection failed: Connection failed";

			mockQuery.mockRejectedValueOnce(new Error(errorMessage));
			// override error translation
			mockI18nService.t.mockImplementation((key: string) => {
				if (key === translatedErrorKey) return translatedMessage;
				return key;
			});

			await service.pingDb();

			expect(mockLogger.error).toHaveBeenCalledWith(translatedMessage);
			expect(mockRabbitMQService.sendErrorMessage).toHaveBeenCalledWith(
				RABBITMQ_QUEUE.ERROR_QUEUE,
				{
					type: RabbitMQ_SEND_TYPE.MSSQL_ERROR,
					reason: translatedMessage,
					at: expect.any(String),
				},
			);
		});
	});
});
