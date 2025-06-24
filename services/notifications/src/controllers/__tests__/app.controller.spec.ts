import AppController from "src/controllers/app.controller";
import HTTPExceptionFilter from "src/filters/http.filter";
import AppService from "src/services/app.service";
import FileLogger from "src/services/logger.service";
import RabbitMQService from "src/services/rabbitmq.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("AppController", () => {
	let controller: AppController;
	let service: AppService;

	// Заглушки для зависимостей фильтра
	const mockRabbit = { sendErrorMessage: jest.fn() };
	const mockLogger = {
		setContext: jest.fn(),
		error: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				// Мокаем AppService
				{
					provide: AppService,
					useValue: {
						healthcheck: jest.fn(),
					},
				},
				// Регистрируем фильтр и его зависимости
				HTTPExceptionFilter,
				{ provide: RabbitMQService, useValue: mockRabbit },
				{ provide: FileLogger, useValue: mockLogger },
			],
		}).compile();

		controller = module.get<AppController>(AppController);
		service = module.get<AppService>(AppService);
	});

	describe("healthcheck", () => {
		it("should call AppService.healthcheck and return undefined", () => {
			// arrange: пусть healthcheck ничего не возвращает
			(service.healthcheck as jest.Mock).mockReturnValue(undefined);

			// act
			const result = controller.healthcheck();

			// assert
			expect(service.healthcheck).toHaveBeenCalledTimes(1);
			expect(result).toBeUndefined();
		});
	});
});
