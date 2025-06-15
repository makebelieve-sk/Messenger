import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import RabbitMQExceptionFilter from "src/filters/rabbitmq.filter";
import RabbitMQService from "src/services/rabbitmq.service";
import RedisService from "src/services/redis.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import { RABBITMQ_QUEUE, REDIS_CHANNEL } from "src/types/enums";
import { NOTIFICATION_TYPE } from "src/types/enums";
import { ArgumentsHost } from "@nestjs/common";
import { RmqContext } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";

describe("RabbitMQExceptionFilter", () => {
	let filter: RabbitMQExceptionFilter;
	let rabbitMQService: jest.Mocked<RabbitMQService>;
	let redisService: jest.Mocked<RedisService>;
	let sentNotificationsService: jest.Mocked<SentNotificationsService>;

	const mockChannel = {
		nack: jest.fn(),
	};

	const mockMessage = {
		content: Buffer.from(JSON.stringify({ test: "data" })),
	};

	const mockRmqContext = {
		getChannelRef: () => mockChannel,
		getMessage: () => mockMessage,
		getPattern: () => "test-pattern",
		args: [],
		getArgs: () => [],
		getArgByIndex: () => null,
	} as unknown as RmqContext;

	const mockPayload = {
		userName: "Test User",
		avatarUrl: "https://example.com/avatar.jpg",
		title: "Test Title",
		mainText: "Test Message",
	};

	const mockArgumentsHost = {
		switchToRpc: () => ({
			getContext: () => mockRmqContext,
			getData: () =>
				({
					recipient: "test-recipient",
					type: NOTIFICATION_TYPE.EMAIL,
					payload: mockPayload,
					action: "test-action",
				}) as unknown as NotificationQueueDto,
		}),
	} as ArgumentsHost;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RabbitMQExceptionFilter,
				{
					provide: RabbitMQService,
					useValue: {
						sendErrorNotificationMessage: jest.fn(),
					},
				},
				{
					provide: RedisService,
					useValue: {
						publish: jest.fn(),
					},
				},
				{
					provide: SentNotificationsService,
					useValue: {
						create: jest.fn(),
					},
				},
			],
		}).compile();

		filter = module.get<RabbitMQExceptionFilter>(RabbitMQExceptionFilter);
		rabbitMQService = module.get(RabbitMQService);
		redisService = module.get(RedisService);
		sentNotificationsService = module.get(SentNotificationsService);
	});

	it("should be defined", () => {
		expect(filter).toBeDefined();
	});

	it("should handle error and perform all required actions", () => {
		const error = new Error("Test error");
		const expectedData = {
			recipient: "test-recipient",
			type: NOTIFICATION_TYPE.EMAIL,
			payload: mockPayload,
			action: "test-action",
		};

		filter.catch(error, mockArgumentsHost);

		// Verify channel.nack was called
		expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);

		// Verify Redis publish was called
		expect(redisService.publish).toHaveBeenCalledWith(
			REDIS_CHANNEL.FAILED_NOTIFICATIONS,
			expectedData,
		);

		// Verify database record was created
		expect(sentNotificationsService.create).toHaveBeenCalledWith({
			recipientId: expectedData.recipient,
			type: expectedData.type,
			payload: JSON.stringify(expectedData.payload),
			action: expectedData.action,
			success: false,
			errorMessage: error.message,
		});

		// Verify error message was sent to RabbitMQ
		expect(rabbitMQService.sendErrorNotificationMessage).toHaveBeenCalledWith(
			RABBITMQ_QUEUE.ERROR_NOTIFICATION_QUEUE,
			expectedData,
		);
	});

	it("should handle error without message property", () => {
		const error = new Error();
		error.message = undefined;
		error.stack = "Test stack trace";

		filter.catch(error, mockArgumentsHost);

		expect(sentNotificationsService.create).toHaveBeenCalledWith(
			expect.objectContaining({
				errorMessage: "Test stack trace",
			}),
		);
	});

	it("should handle error without message and stack properties", () => {
		const error = new Error();
		error.message = undefined;
		error.stack = undefined;

		filter.catch(error, mockArgumentsHost);

		expect(sentNotificationsService.create).toHaveBeenCalledWith(
			expect.objectContaining({
				errorMessage: expect.any(String),
			}),
		);
	});
});
