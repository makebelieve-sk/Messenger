import HTTPExceptionFilter from "src/filters/http.filter";
import AppService from "src/services/app.service";
import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	UseFilters,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

// Контроллер, управляет сервисом в зависимости от основных HTTP запросов
@ApiTags()
@Controller()
@UseFilters(HTTPExceptionFilter)
export default class AppController {
	constructor(private readonly appService: AppService) {}

	@ApiOperation({ summary: "Статус доступности сервиса" })
	@ApiResponse({ status: 204 })
	@Get("healthcheck")
	@HttpCode(HttpStatus.NO_CONTENT)
	healthcheck() {
		this.appService.healthcheck();
	}
}
