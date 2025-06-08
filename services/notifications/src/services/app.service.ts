import { Injectable } from "@nestjs/common";
import AppInterface from "src/interfaces/app.interface";

// Сервис, содержит методы для обработки основных HTTP запросов
@Injectable()
export class AppService implements AppInterface {
	healthcheck() {
		return true;
	}
}
