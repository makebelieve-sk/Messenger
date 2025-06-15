import AppController from "src/controllers/app.controller";
import GlobalFilter from "src/filters/global.filter";
import AppModule from "src/modules/app.module";
import AppService from "src/services/app.service";
import GracefulShutdownService from "src/services/graceful-shutdown.service";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";

jest.mock("node-telegram-bot-api", () => {
	return {
		__esModule: true,
		default: jest.fn().mockImplementation(() => ({
			onText: jest.fn(),
			sendMessage: jest.fn(),
			setWebHook: jest.fn(),
			getMe: jest.fn(),
		})),
	};
});

describe("AppModule", () => {
	it("should compile the module successfully", async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		const appController = moduleRef.get(AppController);
		const appService = moduleRef.get(AppService);
		const shutdownService = moduleRef.get(GracefulShutdownService);
		const globalFilter = moduleRef.get(GlobalFilter);

		expect(appController).toBeDefined();
		expect(appService).toBeDefined();
		expect(shutdownService).toBeDefined();
		expect(globalFilter).toBeDefined();
	});

	it("should load configuration and apply validation", async () => {
		const validateEnv = jest.fn().mockReturnValue(true);

		const envBackup = process.env.NODE_ENV;
		process.env.NODE_ENV = "development";

		const moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					envFilePath: [".env.development", ".env"],
					load: [],
					validate: validateEnv,
				}),
			],
		}).compile();

		expect(moduleRef).toBeDefined();
		expect(validateEnv).toHaveBeenCalled();

		process.env.NODE_ENV = envBackup;
	});
});
