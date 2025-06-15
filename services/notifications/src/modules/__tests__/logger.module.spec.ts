import LoggerModule from "src/modules/logger.module";
import FileLogger from "src/services/logger.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("LoggerModule", () => {
	let module: TestingModule;

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [LoggerModule],
		}).compile();
	});

	it("should compile the module", () => {
		expect(module).toBeDefined();
	});

	it("should provide FileLogger", async () => {
		const logger = await module.resolve<FileLogger>(FileLogger);
		expect(logger).toBeDefined();
		expect(typeof logger.log).toBe("function"); // Проверь метод из своего класса
	});
});
