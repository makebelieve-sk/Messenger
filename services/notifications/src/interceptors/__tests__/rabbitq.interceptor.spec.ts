import { I18nService } from "nestjs-i18n";
import { of, throwError } from "rxjs";
import RabbitLoggingInterceptor from "src/interceptors/rabbitmq.interceptor";
import FileLogger from "src/services/logger.service";
import { CONTEXT_TYPE } from "src/types/enums";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { RmqContext } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";

describe("RabbitLoggingInterceptor", () => {
	let interceptor: RabbitLoggingInterceptor;

	const mockLogger = {
		setContext: jest.fn(),
		log: jest.fn(),
		error: jest.fn(),
	};

	const mockI18n = {
		t: jest.fn((key: string) => key),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RabbitLoggingInterceptor,
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

		interceptor = module.get<RabbitLoggingInterceptor>(RabbitLoggingInterceptor);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(interceptor).toBeDefined();
	});

	it("should pass through if context type is not RPC", async () => {
		const mockContext = {
			getType: jest.fn().mockReturnValue("http"),
			getClass: jest.fn(),
			getHandler: jest.fn(),
			getArgs: jest.fn(),
			getArgByIndex: jest.fn(),
			switchToHttp: jest.fn(),
			switchToRpc: jest.fn(),
			switchToWs: jest.fn(),
		} as unknown as ExecutionContext;

		const mockHandler = {
			handle: jest.fn().mockReturnValue(of({})),
		} as CallHandler;

		await interceptor.intercept(mockContext, mockHandler);

		expect(mockHandler.handle).toHaveBeenCalled();
		expect(mockLogger.log).not.toHaveBeenCalled();
	});

	it("should log successful message processing", async () => {
		const mockData = { test: "data" };
		const mockRoutingKey = "test.queue";
		const mockMessage = {
			fields: { routingKey: mockRoutingKey },
		};

		const mockRmqContext = {
			getMessage: jest.fn().mockReturnValue(mockMessage),
			getChannelRef: jest.fn(),
			getPattern: jest.fn(),
			args: [],
			getArgs: jest.fn(),
			getArgByIndex: jest.fn(),
		} as unknown as RmqContext;

		const mockContext = {
			getType: jest.fn().mockReturnValue(CONTEXT_TYPE.RPC),
			getClass: jest.fn(),
			getHandler: jest.fn(),
			getArgs: jest.fn(),
			getArgByIndex: jest.fn(),
			switchToHttp: jest.fn(),
			switchToRpc: jest.fn().mockReturnValue({
				getData: jest.fn().mockReturnValue(mockData),
				getContext: jest.fn().mockReturnValue(mockRmqContext),
			}),
			switchToWs: jest.fn(),
		} as unknown as ExecutionContext;

		const mockHandler = {
			handle: jest.fn().mockReturnValue(of({})),
		} as CallHandler;

		const result = await interceptor.intercept(mockContext, mockHandler);
		await result.toPromise();

		expect(mockI18n.t).toHaveBeenCalledWith("rabbitmq.message-received", {
			args: { routingKey: mockRoutingKey, data: JSON.stringify(mockData) },
		});
		expect(mockI18n.t).toHaveBeenCalledWith("rabbitmq.message-processed", {
			args: expect.any(Object),
		});
		expect(mockLogger.log).toHaveBeenCalledTimes(2);
	});

	it("should log error when message processing fails", async () => {
		const mockData = { test: "data" };
		const mockRoutingKey = "test.queue";
		const mockMessage = {
			fields: { routingKey: mockRoutingKey },
		};
		const mockError = new Error("Test error");

		const mockRmqContext = {
			getMessage: jest.fn().mockReturnValue(mockMessage),
			getChannelRef: jest.fn(),
			getPattern: jest.fn(),
			args: [],
			getArgs: jest.fn(),
			getArgByIndex: jest.fn(),
		} as unknown as RmqContext;

		const mockContext = {
			getType: jest.fn().mockReturnValue(CONTEXT_TYPE.RPC),
			getClass: jest.fn(),
			getHandler: jest.fn(),
			getArgs: jest.fn(),
			getArgByIndex: jest.fn(),
			switchToHttp: jest.fn(),
			switchToRpc: jest.fn().mockReturnValue({
				getData: jest.fn().mockReturnValue(mockData),
				getContext: jest.fn().mockReturnValue(mockRmqContext),
			}),
			switchToWs: jest.fn(),
		} as unknown as ExecutionContext;

		const mockHandler = {
			handle: jest.fn().mockReturnValue(throwError(() => mockError)),
		} as CallHandler;

		const result = await interceptor.intercept(mockContext, mockHandler);
		try {
			await result.toPromise();
		} catch (error) {
			expect(error).toBe(mockError);
		}

		expect(mockI18n.t).toHaveBeenCalledWith("rabbitmq.message-received", {
			args: { routingKey: mockRoutingKey, data: JSON.stringify(mockData) },
		});
		expect(mockI18n.t).toHaveBeenCalledWith("rabbitmq.message-error", {
			args: expect.any(Object),
		});
		expect(mockLogger.log).toHaveBeenCalledTimes(1);
		expect(mockLogger.error).toHaveBeenCalledTimes(1);
	});

	it("should use unknown queue when routing key is not provided", async () => {
		const mockData = { test: "data" };
		const mockMessage = {
			fields: {},
		};

		const mockRmqContext = {
			getMessage: jest.fn().mockReturnValue(mockMessage),
			getChannelRef: jest.fn(),
			getPattern: jest.fn(),
			args: [],
			getArgs: jest.fn(),
			getArgByIndex: jest.fn(),
		} as unknown as RmqContext;

		const mockContext = {
			getType: jest.fn().mockReturnValue(CONTEXT_TYPE.RPC),
			getClass: jest.fn(),
			getHandler: jest.fn(),
			getArgs: jest.fn(),
			getArgByIndex: jest.fn(),
			switchToHttp: jest.fn(),
			switchToRpc: jest.fn().mockReturnValue({
				getData: jest.fn().mockReturnValue(mockData),
				getContext: jest.fn().mockReturnValue(mockRmqContext),
			}),
			switchToWs: jest.fn(),
		} as unknown as ExecutionContext;

		const mockHandler = {
			handle: jest.fn().mockReturnValue(of({})),
		} as CallHandler;

		const result = await interceptor.intercept(mockContext, mockHandler);
		await result.toPromise();

		expect(mockI18n.t).toHaveBeenCalledWith("rabbitmq.unknown_queue");
		expect(mockLogger.log).toHaveBeenCalledTimes(2);
	});
});
