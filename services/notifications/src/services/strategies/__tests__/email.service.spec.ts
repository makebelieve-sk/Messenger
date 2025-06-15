import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import FileLogger from "src/services/logger.service";
import NodemailerService from "src/services/nodemailer.service";
import RedisService from "src/services/redis.service";
import EmailService from "src/services/strategies/email.service";
import PincodesService from "src/services/tables/pincodes.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import UsersService from "src/services/tables/users.service";
import { STRATEGY_ACTION } from "src/types/enums";
import { Test, TestingModule } from "@nestjs/testing";

// Mock crypto.randomInt
jest.mock("crypto", () => ({
	randomInt: jest.fn().mockReturnValue(123456),
}));

describe("EmailService", () => {
	let service: EmailService;
	let nodemailerService: jest.Mocked<NodemailerService>;
	let logger: jest.Mocked<FileLogger>;
	let sentNotificationsService: jest.Mocked<SentNotificationsService>;
	let pincodesService: jest.Mocked<PincodesService>;
	let usersService: jest.Mocked<UsersService>;

	const mockEmail = "test@example.com";
	const mockPayload: PayloadNotificationDto = {
		userName: "Test User",
		avatarUrl: "https://example.com/avatar.jpg",
		title: "Test Title",
		mainText: "Test Main Text",
		text: "Test Text",
	};

	const mockUser = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		firstName: "Test",
		secondName: null,
		thirdName: "User",
		email: mockEmail,
		phone: "+1234567890",
		password: "hashed_password",
		salt: "salt",
		avatarId: null,
		isDeleted: false,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				EmailService,
				{
					provide: NodemailerService,
					useValue: {
						sendMail: jest.fn(),
						supportMail: "support@example.com",
					},
				},
				{
					provide: FileLogger,
					useValue: {
						log: jest.fn(),
					},
				},
				{
					provide: SentNotificationsService,
					useValue: {
						create: jest.fn(),
					},
				},
				{
					provide: PincodesService,
					useValue: {
						create: jest.fn(),
					},
				},
				{
					provide: I18nService,
					useValue: {
						t: jest.fn((key) => key),
					},
				},
				{
					provide: UsersService,
					useValue: {
						findOneBy: jest.fn().mockResolvedValue(mockUser),
						findOne: jest.fn().mockResolvedValue(mockUser),
					},
				},
				{
					provide: RedisService,
					useValue: {
						get: jest.fn().mockResolvedValue(null),
						set: jest.fn().mockResolvedValue("OK"),
						del: jest.fn().mockResolvedValue(1),
						publishWithAck: jest.fn().mockResolvedValue(true),
					},
				},
				{
					provide: TelegramUsersService,
					useValue: {
						findOneBy: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<EmailService>(EmailService);
		nodemailerService = module.get(NodemailerService);
		logger = module.get(FileLogger);
		sentNotificationsService = module.get(SentNotificationsService);
		pincodesService = module.get(PincodesService);
		usersService = module.get(UsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("send", () => {
		beforeEach(() => {
			usersService.findOneBy.mockResolvedValue(mockUser);
		});

		it("should send pincode email", async () => {
			const recipient = "user123";
			const action = STRATEGY_ACTION.PINCODE;

			await service.send(recipient, mockPayload, action);

			expect(nodemailerService.sendMail).toHaveBeenCalledWith(
				mockEmail,
				expect.any(String),
				expect.stringContaining("123456"),
			);
			expect(sentNotificationsService.create).toHaveBeenCalled();
			expect(pincodesService.create).toHaveBeenCalled();
		});

		it("should send login notification email", async () => {
			const recipient = "user123";
			const action = STRATEGY_ACTION.LOGIN;

			await service.send(recipient, mockPayload, action);

			expect(nodemailerService.sendMail).toHaveBeenCalledWith(
				mockEmail,
				expect.any(String),
				expect.stringContaining("security_notification"),
			);
			expect(sentNotificationsService.create).toHaveBeenCalled();
		});

		it("should send new notification email", async () => {
			const recipient = "user123";
			const action = STRATEGY_ACTION.NEW_NOTIFICATION;

			await service.send(recipient, mockPayload, action);

			expect(nodemailerService.sendMail).toHaveBeenCalledWith(
				mockEmail,
				expect.any(String),
				expect.stringContaining(mockPayload.title),
			);
			expect(sentNotificationsService.create).toHaveBeenCalled();
		});

		it("should handle empty email template for unknown action", async () => {
			const recipient = "user123";
			const action = "UNKNOWN_ACTION" as STRATEGY_ACTION;

			await service.send(recipient, mockPayload, action);

			expect(nodemailerService.sendMail).toHaveBeenCalledWith(mockEmail, "", "");
		});

		it("should log the email sending process", async () => {
			const recipient = "user123";
			const action = STRATEGY_ACTION.LOGIN;

			await service.send(recipient, mockPayload, action);

			expect(logger.log).toHaveBeenCalledWith(
				expect.stringContaining("strategies.email-send"),
			);
		});
	});
});
