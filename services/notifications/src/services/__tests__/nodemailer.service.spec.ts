import { I18nService } from "nestjs-i18n";
import { Transporter } from "nodemailer";
import ConfigError from "src/errors/config.error";
import FileLogger from "src/services/logger.service";
import NodemailerService from "src/services/nodemailer.service";
import { INJECTION_KEYS } from "src/types/enums";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

describe("NodemailerService", () => {
	let service: NodemailerService;
	let mockTransporter: jest.Mocked<Transporter>;
	let mockLogger: jest.Mocked<FileLogger>;
	let mockConfigService: jest.Mocked<ConfigService>;
	let mockI18n: jest.Mocked<I18nService>;

	const mockNodemailerConfig = {
		from: {
			name: "Test Name",
			email: "test@example.com",
		},
	};

	beforeEach(async () => {
		mockTransporter = {
			sendMail: jest.fn().mockResolvedValue({}),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;

		mockLogger = {
			setContext: jest.fn(),
			debug: jest.fn(),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;

		mockConfigService = {
			get: jest.fn().mockReturnValue(mockNodemailerConfig),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;

		mockI18n = {
			t: jest.fn().mockImplementation((key) => key),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NodemailerService,
				{
					provide: INJECTION_KEYS.NODEMAILER_SERVER,
					useValue: mockTransporter,
				},
				{
					provide: FileLogger,
					useValue: mockLogger,
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: I18nService,
					useValue: mockI18n,
				},
			],
		}).compile();

		service = module.get<NodemailerService>(NodemailerService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should throw ConfigError if nodemailer config is not found", async () => {
		mockConfigService.get.mockReturnValueOnce(undefined);
		mockI18n.t.mockReturnValueOnce("Config error message");

		await expect(
			Test.createTestingModule({
				providers: [
					NodemailerService,
					{
						provide: INJECTION_KEYS.NODEMAILER_SERVER,
						useValue: mockTransporter,
					},
					{
						provide: FileLogger,
						useValue: mockLogger,
					},
					{
						provide: ConfigService,
						useValue: mockConfigService,
					},
					{
						provide: I18nService,
						useValue: mockI18n,
					},
				],
			}).compile(),
		).rejects.toThrow(ConfigError);
	});

	it("should set logger context on initialization", () => {
		expect(mockLogger.setContext).toHaveBeenCalledWith("NodemailerService");
	});

	it("should return support mail address", () => {
		expect(service.supportMail).toBe(mockNodemailerConfig.from.email);
	});

	it("should format from title correctly", () => {
		const expectedTitle = `"${mockNodemailerConfig.from.name}" <${mockNodemailerConfig.from.email}>`;
		expect(service["fromTitle"]).toBe(expectedTitle);
	});

	describe("sendMail", () => {
		const testTo = "recipient@example.com";
		const testSubject = "Test Subject";
		const testHtml = "<p>Test content</p>";

		it("should send email successfully", async () => {
			await service.sendMail(testTo, testSubject, testHtml);

			expect(mockLogger.debug).toHaveBeenCalledWith(
				expect.stringContaining("nodemailer.send-email"),
			);
			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: `"${mockNodemailerConfig.from.name}" <${mockNodemailerConfig.from.email}>`,
				to: testTo,
				subject: testSubject,
				html: testHtml,
			});
		});

		it("should handle sendMail error", async () => {
			const error = new Error("Send mail error");
			mockTransporter.sendMail.mockRejectedValueOnce(error);

			await expect(
				service.sendMail(testTo, testSubject, testHtml),
			).rejects.toThrow(error);
		});
	});
});
