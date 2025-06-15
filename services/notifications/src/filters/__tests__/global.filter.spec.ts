import BaseError from "src/errors/base.error";
import GlobalFilter from "src/filters/global.filter";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import { RABBITMQ_QUEUE, RabbitMQ_SEND_TYPE } from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";

// Concrete implementation of BaseError for testing
class TestBaseError extends BaseError {
	readonly code = "TEST_ERROR";
	readonly status = 500;

	constructor(message: string) {
		super(message);
	}
}

describe("GlobalFilter", () => {
	let filter: GlobalFilter;
	let rabbitMQService: RabbitMQService;
	let logger: FileLogger;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GlobalFilter,
				{
					provide: RabbitMQService,
					useValue: {
						sendErrorMessage: jest.fn(),
					},
				},
				{
					provide: FileLogger,
					useValue: {
						setContext: jest.fn(),
						error: jest.fn(),
					},
				},
			],
		}).compile();

		filter = module.get<GlobalFilter>(GlobalFilter);
		rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
		logger = module.get<FileLogger>(FileLogger);
	});

	it("should be defined", () => {
		expect(filter).toBeDefined();
	});

	it("should set context on initialization", () => {
		expect(logger.setContext).toHaveBeenCalledWith("GlobalFilter");
	});

	describe("catch", () => {
		it("should handle BaseError correctly", () => {
			const error = new TestBaseError("Test error");
			const errorSpy = jest.spyOn(logger, "error");
			const rabbitMQSpy = jest.spyOn(rabbitMQService, "sendErrorMessage");

			filter.catch(error);

			expect(errorSpy).toHaveBeenCalledWith(
				"Caught exception: Test error.",
				expect.any(String),
			);

			expect(rabbitMQSpy).toHaveBeenCalledWith(RABBITMQ_QUEUE.ERROR_QUEUE, {
				type: RabbitMQ_SEND_TYPE.APP_ERROR,
				reason: "Caught exception: Test error.",
				at: expect.any(String),
			});
		});

		it("should convert regular Error to AppError", () => {
			const error = new Error("Regular error");
			const errorSpy = jest.spyOn(logger, "error");
			const rabbitMQSpy = jest.spyOn(rabbitMQService, "sendErrorMessage");

			filter.catch(error);

			expect(errorSpy).toHaveBeenCalledWith(
				"Caught exception: Regular error.",
				expect.any(String),
			);

			expect(rabbitMQSpy).toHaveBeenCalledWith(RABBITMQ_QUEUE.ERROR_QUEUE, {
				type: RabbitMQ_SEND_TYPE.APP_ERROR,
				reason: "Caught exception: Regular error.",
				at: expect.any(String),
			});
		});

		it("should handle error without stack trace", () => {
			const error = new Error("Error without stack");
			error.stack = undefined;
			const errorSpy = jest.spyOn(logger, "error");
			const rabbitMQSpy = jest.spyOn(rabbitMQService, "sendErrorMessage");

			filter.catch(error);

			expect(errorSpy).toHaveBeenCalledWith(
				"Caught exception: Error without stack.",
				expect.any(String),
			);

			expect(rabbitMQSpy).toHaveBeenCalledWith(RABBITMQ_QUEUE.ERROR_QUEUE, {
				type: RabbitMQ_SEND_TYPE.APP_ERROR,
				reason: "Caught exception: Error without stack.",
				at: expect.any(String),
			});
		});
	});
});
