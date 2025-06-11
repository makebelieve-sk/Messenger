import AppController from "src/controllers/app.controller";
import AppService from "src/services/app.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("AppController", () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [AppService],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe("root", () => {
		it('should return "Hello World!"', () => {
			expect(appController.healthcheck()).toHaveBeenCalled();
		});
	});
});
