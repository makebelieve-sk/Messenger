import { I18nService } from "nestjs-i18n";
import GlobalI18nModule from "src/modules/i18n.module";
import { Test, TestingModule } from "@nestjs/testing";

describe("GlobalI18nModule", () => {
	let module: TestingModule;

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [GlobalI18nModule],
		}).compile();
	});

	it("should compile the module", () => {
		expect(module).toBeDefined();
	});

	it("should provide I18nService", () => {
		const i18nService = module.get<I18nService>(I18nService);
		expect(i18nService).toBeDefined();
		expect(typeof i18nService.t).toBe("function");
	});
});
