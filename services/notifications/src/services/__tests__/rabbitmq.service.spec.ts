import { I18nService } from "nestjs-i18n";
import { ErrorQueueDto, NotificationQueueDto } from "src/dto/rabbitmq.dto";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import {
	INJECTION_KEYS,
	NOTIFICATION_TYPE,
	RABBITMQ_QUEUE,
	RabbitMQ_SEND_TYPE,
	STRATEGY_ACTION,
} from "src/types/enums";
import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";

describe("RabbitMQService", () => {
	let service: RabbitMQService;
	let clientNotification: ClientProxy;
	let clientErrorNotification: ClientProxy;
	let clientError: ClientProxy;
	let logger: FileLogger;

	const mockClientProxy = {
		connect: jest.fn().mockResolvedValue(undefined),
		emit: jest.fn(),
		close: jest.fn().mockResolvedValue(undefined),
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
				RabbitMQService,
				{
					provide: INJECTION_KEYS.RABBITMQ_NOTIFICATION_SERVER,
					useValue: mockClientProxy,
				},
				{
					provide: INJECTION_KEYS.RABBITMQ_ERROR_NOTIFICATION_SERVER,
					useValue: mockClientProxy,
				},
				{
					provide: INJECTION_KEYS.RABBITMQ_ERROR_SERVER,
					useValue: mockClientProxy,
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

		service = module.get<RabbitMQService>(RabbitMQService);
		clientNotification = module.get(INJECTION_KEYS.RABBITMQ_NOTIFICATION_SERVER);
		clientErrorNotification = module.get(
			INJECTION_KEYS.RABBITMQ_ERROR_NOTIFICATION_SERVER,
		);
		clientError = module.get(INJECTION_KEYS.RABBITMQ_ERROR_SERVER);
		logger = module.get<FileLogger>(FileLogger);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("onModuleInit", () => {
		it("should connect to all RabbitMQ clients", async () => {
			await service.onModuleInit();

			expect(clientNotification.connect).toHaveBeenCalled();
			expect(clientErrorNotification.connect).toHaveBeenCalled();
			expect(clientError.connect).toHaveBeenCalled();
		});
	});

	describe("sendNotificationMessage", () => {
		it("should send notification message", () => {
			const pattern = RABBITMQ_QUEUE.NOTIFICATION_QUEUE;
			const data: NotificationQueueDto = {
				type: NOTIFICATION_TYPE.TELEGRAM,
				recipient: "test-recipient",
				payload: {
					userName: "Test User",
					avatarUrl: "https://example.com/avatar",
					title: "Test Title",
					mainText: "Test Main Text",
					text: "Test Text",
				},
				action: STRATEGY_ACTION.NEW_NOTIFICATION,
			};

			service.sendNotificationMessage(pattern, data);

			expect(logger.debug).toHaveBeenCalled();
			expect(clientNotification.emit).toHaveBeenCalledWith(pattern, data);
		});
	});

	describe("sendErrorNotificationMessage", () => {
		it("should send error notification message", () => {
			const pattern = RABBITMQ_QUEUE.NOTIFICATION_QUEUE;
			const data: NotificationQueueDto = {
				type: NOTIFICATION_TYPE.TELEGRAM,
				recipient: "test-recipient",
				payload: {
					userName: "Test User",
					avatarUrl: "https://example.com/avatar",
					title: "Test Title",
					mainText: "Test Main Text",
					text: "Test Text",
				},
				action: STRATEGY_ACTION.NEW_NOTIFICATION,
			};

			service.sendErrorNotificationMessage(pattern, data);

			expect(logger.debug).toHaveBeenCalled();
			expect(clientErrorNotification.emit).toHaveBeenCalledWith(pattern, data);
		});
	});

	describe("sendErrorMessage", () => {
		it("should send error message", () => {
			const pattern = RABBITMQ_QUEUE.ERROR_QUEUE;
			const data: ErrorQueueDto = {
				type: RabbitMQ_SEND_TYPE.APP_ERROR,
				reason: "Test Error",
				at: new Date().toISOString(),
			};

			service.sendErrorMessage(pattern, data);

			expect(logger.debug).toHaveBeenCalled();
			expect(clientError.emit).toHaveBeenCalledWith(pattern, data);
		});
	});

	describe("close", () => {
		it("should close all RabbitMQ connections", async () => {
			await service.close();

			expect(clientNotification.close).toHaveBeenCalled();
			expect(clientErrorNotification.close).toHaveBeenCalled();
			expect(clientError.close).toHaveBeenCalled();
			expect(logger.debug).toHaveBeenCalled();
		});
	});
});
