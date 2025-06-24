import { I18nService } from "nestjs-i18n";
import TelegramBot, {
	Contact,
	Message,
	ParseMode,
} from "node-telegram-bot-api";
import UsersDto from "src/dto/tables/users.dto";
import StrategyError from "src/errors/strategy.error";
import FileLogger from "src/services/logger.service";
import NodeTelegramService from "src/services/node-telegram.service";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import UsersService from "src/services/tables/users.service";
import { INJECTION_KEYS } from "src/types/enums";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

describe("NodeTelegramService", () => {
	let service: NodeTelegramService;
	let bot: jest.Mocked<TelegramBot>;
	let logger: jest.Mocked<FileLogger>;
	let i18n: jest.Mocked<I18nService>;
	let configService: jest.Mocked<ConfigService>;
	let telegramUsersService: jest.Mocked<TelegramUsersService>;
	let usersService: jest.Mocked<UsersService>;

	const mockConfig = {
		channelName: "@testchannel",
	};

	beforeEach(async () => {
		bot = {
			sendMessage: jest.fn(),
			on: jest.fn(),
			startPolling: jest.fn(),
			stopPolling: jest.fn(),
			isPolling: jest.fn(),
			openWebHook: jest.fn(),
			closeWebHook: jest.fn(),
			getMe: jest.fn(),
			getChat: jest.fn(),
			getChatAdministrators: jest.fn(),
			getChatMember: jest.fn(),
			getChatMembersCount: jest.fn(),
			getFile: jest.fn(),
			getFileStream: jest.fn(),
			getGameHighScores: jest.fn(),
			getStickerSet: jest.fn(),
			getUpdates: jest.fn(),
			getWebHookInfo: jest.fn(),
			leaveChat: jest.fn(),
			pinChatMessage: jest.fn(),
			promoteChatMember: jest.fn(),
			restrictChatMember: jest.fn(),
			sendAudio: jest.fn(),
			sendChatAction: jest.fn(),
			sendDocument: jest.fn(),
			sendGame: jest.fn(),
			sendInvoice: jest.fn(),
			sendLocation: jest.fn(),
			sendMediaGroup: jest.fn(),
			sendPhoto: jest.fn(),
			sendPoll: jest.fn(),
			sendSticker: jest.fn(),
			sendVenue: jest.fn(),
			sendVideo: jest.fn(),
			sendVideoNote: jest.fn(),
			sendVoice: jest.fn(),
			setChatDescription: jest.fn(),
			setChatPhoto: jest.fn(),
			setChatStickerSet: jest.fn(),
			setChatTitle: jest.fn(),
			setGameScore: jest.fn(),
			setMyCommands: jest.fn(),
			setStickerPositionInSet: jest.fn(),
			setWebHook: jest.fn(),
			stopMessageLiveLocation: jest.fn(),
			unbanChatMember: jest.fn(),
			unpinChatMessage: jest.fn(),
			uploadStickerFile: jest.fn(),
			answerCallbackQuery: jest.fn(),
			answerInlineQuery: jest.fn(),
			answerPreCheckoutQuery: jest.fn(),
			answerShippingQuery: jest.fn(),
			deleteChatPhoto: jest.fn(),
			deleteChatStickerSet: jest.fn(),
			deleteMessage: jest.fn(),
			deleteStickerFromSet: jest.fn(),
			deleteWebHook: jest.fn(),
			editMessageCaption: jest.fn(),
			editMessageLiveLocation: jest.fn(),
			editMessageMedia: jest.fn(),
			editMessageReplyMarkup: jest.fn(),
			editMessageText: jest.fn(),
			exportChatInviteLink: jest.fn(),
			forwardMessage: jest.fn(),
			getChatMemberCount: jest.fn(),
			kickChatMember: jest.fn(),
			sendAnimation: jest.fn(),
			sendDice: jest.fn(),
			setChatAdministratorCustomTitle: jest.fn(),
			setChatPermissions: jest.fn(),
			setMyDefaultAdministratorRights: jest.fn(),
			setPassportDataErrors: jest.fn(),
			setStickerSetThumb: jest.fn(),
			stopPoll: jest.fn(),
			unbanChatSenderChat: jest.fn(),
			unpinAllChatMessages: jest.fn(),
			emit: jest.fn(),
		} as unknown as jest.Mocked<TelegramBot>;

		logger = {
			setContext: jest.fn(),
			debug: jest.fn(),
			error: jest.fn(),
			log: jest.fn(),
			warn: jest.fn(),
			verbose: jest.fn(),
			close: jest.fn(),
			fatal: jest.fn(),
			setLogLevels: jest.fn(),
			isLevelEnabled: jest.fn(),
		} as unknown as jest.Mocked<FileLogger>;

		i18n = {
			t: jest.fn().mockImplementation((key) => key),
			onModuleDestroy: jest.fn(),
			translate: jest.fn(),
			getSupportedLanguages: jest.fn(),
			getTranslations: jest.fn(),
			validate: jest.fn(),
		} as unknown as jest.Mocked<I18nService>;

		configService = {
			get: jest.fn().mockReturnValue(mockConfig),
			getOrThrow: jest.fn(),
			set: jest.fn(),
			setEnvFilePaths: jest.fn(),
			changes$: jest.fn(),
		} as unknown as jest.Mocked<ConfigService>;

		telegramUsersService = {
			create: jest.fn(),
			findOneBy: jest.fn(),
		} as unknown as jest.Mocked<TelegramUsersService>;

		usersService = {
			findOneBy: jest.fn(),
			findOne: jest.fn(),
		} as unknown as jest.Mocked<UsersService>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NodeTelegramService,
				{
					provide: INJECTION_KEYS.NODE_TELEGRAM,
					useValue: bot,
				},
				{
					provide: FileLogger,
					useValue: logger,
				},
				{
					provide: I18nService,
					useValue: i18n,
				},
				{
					provide: ConfigService,
					useValue: configService,
				},
				{
					provide: TelegramUsersService,
					useValue: telegramUsersService,
				},
				{
					provide: UsersService,
					useValue: usersService,
				},
			],
		}).compile();

		service = module.get<NodeTelegramService>(NodeTelegramService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("onModuleInit", () => {
		it("should register message handlers", () => {
			service.onModuleInit();
			expect(bot.on).toHaveBeenCalledWith("message", expect.any(Function));
			expect(bot.on).toHaveBeenCalledWith("contact", expect.any(Function));
		});
	});

	describe("notifyChannel", () => {
		it("should send message to channel successfully", async () => {
			const text = "Test message";
			await service.notifyChannel(text);
			expect(bot.sendMessage).toHaveBeenCalledWith(mockConfig.channelName, text, {
				parse_mode: "Markdown",
			});
		});

		it("should throw StrategyError when sending fails", async () => {
			const error = new Error("Send failed");
			bot.sendMessage.mockRejectedValueOnce(error);
			await expect(service.notifyChannel("test")).rejects.toThrow(StrategyError);
		});

		it("should throw ConfigError when config is missing", async () => {
			configService.get.mockReturnValueOnce(undefined);
			await expect(service.notifyChannel("test")).rejects.toThrow(StrategyError);
		});
	});

	describe("notifyUser", () => {
		it("should send message to user successfully", async () => {
			const chatId = 123456;
			const message = "Test message";
			await service.notifyUser(chatId, message);
			expect(bot.sendMessage).toHaveBeenCalledWith(chatId, message, undefined);
		});

		it("should send message with options", async () => {
			const chatId = 123456;
			const message = "Test message";
			const options = { parse_mode: "Markdown" as ParseMode };
			await service.notifyUser(chatId, message, options);
			expect(bot.sendMessage).toHaveBeenCalledWith(chatId, message, options);
		});

		it("should throw StrategyError when sending fails", async () => {
			const error = new Error("Send failed");
			bot.sendMessage.mockRejectedValueOnce(error);
			await expect(service.notifyUser(123456, "test")).rejects.toThrow(
				StrategyError,
			);
		});
	});

	describe("message handlers", () => {
		it("should handle /start command", async () => {
			const message: Message = {
				message_id: 1,
				date: Date.now(),
				chat: {
					id: 123456,
					type: "private",
				},
				text: "/start",
			} as Message;

			service.onModuleInit();

			const messageHandler = bot.on.mock.calls.find(
				(call) => call[0] === "message",
			)?.[1];
			if (messageHandler) {
				await messageHandler(message);
			}

			expect(bot.sendMessage).toHaveBeenCalledWith(
				123456,
				expect.any(String),
				expect.objectContaining({
					reply_markup: expect.objectContaining({
						keyboard: expect.any(Array),
					}),
				}),
			);
		});

		it("should handle contact sharing", async () => {
			const mockUser = new UsersDto();
			mockUser.id = "1";
			mockUser.phone = "+1234567890";
			mockUser.firstName = "John";
			mockUser.secondName = "Doe";
			mockUser.thirdName = "";
			mockUser.email = "john@example.com";
			mockUser.password = "hashed_password";
			mockUser.salt = "salt";
			mockUser.avatarId = null;
			mockUser.isDeleted = false;

			usersService.findOneBy.mockResolvedValueOnce(mockUser);

			const message: Message = {
				message_id: 1,
				date: Date.now(),
				chat: {
					id: 123456,
					type: "private",
				},
				from: {
					id: 123456,
					first_name: "John",
					last_name: "Doe",
					username: "johndoe",
				},
				contact: {
					phone_number: "+1234567890",
					first_name: "John",
					last_name: "Doe",
					user_id: 123456,
				} as Contact,
			} as Message;

			service.onModuleInit();

			const contactHandler = bot.on.mock.calls.find(
				(call) => call[0] === "contact",
			)?.[1];
			if (contactHandler) {
				await contactHandler(message);
			}

			expect(telegramUsersService.create).toHaveBeenCalledWith({
				firstName: "John",
				lastName: "Doe",
				userName: "johndoe",
				telegramId: 123456,
				userId: "1",
			});
		});

		it("should handle contact sharing error when user not found", async () => {
			usersService.findOneBy.mockRejectedValueOnce(new Error("User not found"));

			const message: Message = {
				message_id: 1,
				date: Date.now(),
				chat: {
					id: 123456,
					type: "private",
				},
				from: {
					id: 123456,
					first_name: "John",
				},
				contact: {
					phone_number: "+1234567890",
					first_name: "John",
					user_id: 123456,
				} as Contact,
			} as Message;

			service.onModuleInit();

			const contactHandler = bot.on.mock.calls.find(
				(call) => call[0] === "contact",
			)?.[1];
			if (contactHandler) {
				await contactHandler(message);
			}

			expect(bot.sendMessage).toHaveBeenCalledWith(
				123456,
				expect.any(String),
				expect.objectContaining({
					parse_mode: "Markdown",
				}),
			);
		});
	});
});
