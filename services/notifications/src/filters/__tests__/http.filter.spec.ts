import HTTPExceptionFilter from "src/filters/http.filter";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import { RABBITMQ_QUEUE, RabbitMQ_SEND_TYPE } from "src/types/enums";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

describe("HTTPExceptionFilter", () => {
	let filter: HTTPExceptionFilter;
	let rabbitMQService: RabbitMQService;
	let logger: FileLogger;

	const mockRabbitMQService = {
		sendErrorMessage: jest.fn(),
	};

	const mockLogger = {
		setContext: jest.fn(),
		error: jest.fn(),
	};

	const mockResponse = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
	};

	const mockRequest = {
		method: "GET",
		url: "/test",
	};

	const mockHost = {
		switchToHttp: () => ({
			getRequest: () => mockRequest,
			getResponse: () => mockResponse,
		}),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				HTTPExceptionFilter,
				{
					provide: RabbitMQService,
					useValue: mockRabbitMQService,
				},
				{
					provide: FileLogger,
					useValue: mockLogger,
				},
			],
		}).compile();

		filter = module.get<HTTPExceptionFilter>(HTTPExceptionFilter);
		rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
		logger = module.get<FileLogger>(FileLogger);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(filter).toBeDefined();
	});

	it("should handle HttpException correctly", () => {
		const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);
		const errorText = `GET ${HttpStatus.BAD_REQUEST} /test: Test error`;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		filter.catch(exception, mockHost as any);

		expect(logger.error).toHaveBeenCalledWith(errorText, exception.stack);
		expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
		expect(mockResponse.json).toHaveBeenCalledWith({
			statusCode: HttpStatus.BAD_REQUEST,
			timestamp: expect.any(String),
			path: "/test",
			message: "Test error",
		});
		expect(rabbitMQService.sendErrorMessage).not.toHaveBeenCalled();
	});

	it("should handle non-HttpException correctly", () => {
		const exception = new Error("Internal error");
		const errorText = `GET ${HttpStatus.INTERNAL_SERVER_ERROR} /test: Internal error`;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		filter.catch(exception, mockHost as any);

		expect(logger.error).toHaveBeenCalledWith(errorText, exception.stack);
		expect(mockResponse.status).toHaveBeenCalledWith(
			HttpStatus.INTERNAL_SERVER_ERROR,
		);
		expect(mockResponse.json).toHaveBeenCalledWith({
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			timestamp: expect.any(String),
			path: "/test",
			message: "Internal error",
		});
		expect(rabbitMQService.sendErrorMessage).toHaveBeenCalledWith(
			RABBITMQ_QUEUE.ERROR_QUEUE,
			{
				type: RabbitMQ_SEND_TYPE.HTTP_ERROR,
				reason: errorText,
				at: expect.any(String),
			},
		);
	});

	it("should send error to RabbitMQ for 500+ status codes", () => {
		const exception = new HttpException(
			"Server error",
			HttpStatus.INTERNAL_SERVER_ERROR,
		);
		const errorText = `GET ${HttpStatus.INTERNAL_SERVER_ERROR} /test: Server error`;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		filter.catch(exception, mockHost as any);

		expect(rabbitMQService.sendErrorMessage).toHaveBeenCalledWith(
			RABBITMQ_QUEUE.ERROR_QUEUE,
			{
				type: RabbitMQ_SEND_TYPE.HTTP_ERROR,
				reason: errorText,
				at: expect.any(String),
			},
		);
	});

	it("should not send error to RabbitMQ for 400-499 status codes", () => {
		const exception = new HttpException("Client error", HttpStatus.BAD_REQUEST);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		filter.catch(exception, mockHost as any);

		expect(rabbitMQService.sendErrorMessage).not.toHaveBeenCalled();
	});
});
