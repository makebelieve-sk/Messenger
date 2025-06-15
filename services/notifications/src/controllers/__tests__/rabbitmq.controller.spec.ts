import { I18nService } from "nestjs-i18n";
import RabbitMQController from "src/controllers/rabbitmq.controller";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import RabbitMQExceptionFilter from "src/filters/rabbitmq.filter";
import FileLogger from "src/services/logger.service";
import NotificationService from "src/services/notification.service";
import RabbitMQService from "src/services/rabbitmq.service";
import RedisService from "src/services/redis.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import { NOTIFICATION_TYPE, STRATEGY_ACTION } from "src/types/enums";
import { RmqContext } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";

describe("RabbitMQController", () => {
	let controller: RabbitMQController;
	let notifier: NotificationService;
	let logger: FileLogger;
	let i18n: I18nService;

	// Моки
	const mockNotifier = { notify: jest.fn() };
	const mockLogger = { setContext: jest.fn(), debug: jest.fn() };
	const mockI18n = {
		t: jest.fn().mockImplementation((key) => `translated:${key}`),
	};
	const mockRabbitMQService = { sendErrorNotificationMessage: jest.fn() };
	const mockRedisService = { publish: jest.fn() };
	const mockSentNotificationsService = { create: jest.fn() };

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RabbitMQController],
			providers: [
				{ provide: NotificationService, useValue: mockNotifier },
				{ provide: FileLogger, useValue: mockLogger },
				{ provide: I18nService, useValue: mockI18n },
				{ provide: RabbitMQService, useValue: mockRabbitMQService },
				{ provide: RedisService, useValue: mockRedisService },
				{
					provide: SentNotificationsService,
					useValue: mockSentNotificationsService,
				},
				RabbitMQExceptionFilter,
			],
		}).compile();

		controller = module.get<RabbitMQController>(RabbitMQController);
		notifier = module.get<NotificationService>(NotificationService);
		logger = module.get<FileLogger>(FileLogger);
		i18n = module.get<I18nService>(I18nService);
	});

	it("should initialize logger context", () => {
		expect(logger.setContext).toHaveBeenCalledWith("RabbitMQController");
	});

	describe("handleMessage", () => {
		it("should process message and ack", async () => {
			// Подготовим входные данные
			const data: NotificationQueueDto = {
				type: NOTIFICATION_TYPE.TELEGRAM,
				recipient: "FC1999C3-6CC1-4A1D-A95E-1279B141CE32",
				payload: {
					userName: "Алексей",
					avatarUrl: "https://avatars.mds.yandex.net/i",
					title: "Заявка в друзья",
					mainText: "Алексей отправил Вам заявку в друзья",
					text: "Текст сообщения",
				},
				action: STRATEGY_ACTION.NEW_NOTIFICATION,
			};
			const ackMock = jest.fn();
			const channel = { ack: ackMock };
			const message = { some: "msg" };
			const context: RmqContext = {
				getChannelRef: () => channel,
				getMessage: () => message,
			} as unknown as RmqContext;

			// Вызов
			await controller.handleMessage(data, context);

			// Проверяем логирование получения
			expect(i18n.t).toHaveBeenCalledWith(
				"rabbitmq.recieved-message",
				expect.any(Object),
			);
			expect(logger.debug).toHaveBeenCalledWith(
				expect.stringContaining("translated:rabbitmq.recieved-message"),
			);

			// Проверяем вызов нотификатора
			expect(notifier.notify).toHaveBeenCalledWith(
				data.type,
				data.recipient,
				data.payload,
				data.action,
			);

			// Проверяем ack
			expect(ackMock).toHaveBeenCalledWith(message);
		});
	});
});
