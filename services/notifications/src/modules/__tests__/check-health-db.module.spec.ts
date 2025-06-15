import { I18nService } from "nestjs-i18n";
import CheckHealthDatabaseService from "src/services/check-health-db.service";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import PincodesService from "src/services/tables/pincodes.service";
import { DataSource } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";

// Мокаем зависимости
const mockDataSource = {
	query: jest.fn(),
};

const mockPincodesService = {
	getAll: jest.fn().mockResolvedValue([]), // adjust to real methods
};

const mockRabbitMQService = {
	send: jest.fn(),
};

const mockLogger = {
	log: jest.fn(),
	error: jest.fn(),
	setContext: jest.fn(),
};

const mockI18nService = {
	translate: jest.fn().mockResolvedValue("translated-message"),
};

describe("CheckHealthDatabaseService", () => {
	let service: CheckHealthDatabaseService;

	beforeEach(async () => {
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

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
