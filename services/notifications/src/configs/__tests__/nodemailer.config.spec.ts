import nodemailerConfig from "src/configs/nodemailer.config";
import { NodemailerConfig } from "src/configs/nodemailer.config";

describe("NodemailerConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = {
			...originalEnv,
			SMTP_HOST: "smtp.example.com",
			SMTP_PORT: "587",
			SMTP_USER: "test@example.com",
			SMTP_PASSWORD: "test-password",
			SMTP_FROM_NAME: "Test Sender",
			SMTP_FROM_EMAIL: "sender@example.com",
		};
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should be defined", () => {
		expect(nodemailerConfig).toBeDefined();
	});

	it("should register with correct config type", () => {
		const config = nodemailerConfig();
		expect(config).toBeDefined();
	});

	it("should load all environment variables correctly", () => {
		const config = nodemailerConfig() as NodemailerConfig;

		expect(config.host).toBe("smtp.example.com");
		expect(config.port).toBe(587);
		expect(config.secure).toBe(true);
		expect(config.auth.user).toBe("test@example.com");
		expect(config.auth.pass).toBe("test-password");
		expect(config.from.name).toBe("Test Sender");
		expect(config.from.email).toBe("sender@example.com");
	});
});
