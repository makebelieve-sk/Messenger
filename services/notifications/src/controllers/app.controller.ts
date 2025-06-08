import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";

import { AppService } from "../services/app.service";

// Контроллер, управляет сервисом в зависимости от основных HTTP запросов
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('healthcheck')
	@HttpCode(HttpStatus.NO_CONTENT)
	healthcheck() {
		console.log("healthcheck");
		this.appService.healthcheck();
	}
}
