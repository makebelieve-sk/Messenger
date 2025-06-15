import nodeTelegramConfig from "src/configs/telegram.config";
import { CONFIG_TYPE } from "src/types/enums";

describe("nodeTelegramConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = {
			...originalEnv,
			TELEGRAM_BOT_TOKEN: "test-telegram-token",
			TELEGRAM_CHANNEL_NAME: "@testchannel",
		};
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should register config under correct key", () => {
		expect(nodeTelegramConfig.KEY).toBe(
			`CONFIGURATION(${CONFIG_TYPE.NODE_TELEGRAM})`,
		);
	});

	it("should return correct config values from environment", () => {
		const config = nodeTelegramConfig();

		expect(config).toEqual({
			token: "test-telegram-token",
			options: {
				polling: true,
			},
			channelName: "@testchannel",
		});
	});

	it("should throw if TELEGRAM_BOT_TOKEN is missing", async () => {
		delete process.env.TELEGRAM_BOT_TOKEN;

		const config = await nodeTelegramConfig();
		expect(config.token).toBeUndefined();
	});

	it("should throw if TELEGRAM_CHANNEL_NAME is missing", async () => {
		delete process.env.TELEGRAM_CHANNEL_NAME;

		const config = await nodeTelegramConfig();
		expect(config.channelName).toBeUndefined();
	});
});
