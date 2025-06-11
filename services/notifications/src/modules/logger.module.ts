import FileLogger from "src/services/logger.service";
import { Global, Module } from "@nestjs/common";

// Глобальный модуль для пользовательского логгера (расширяем логгер Nest.js путем записи логов в файл)
@Global()
@Module({
	providers: [FileLogger],
	exports: [FileLogger],
})
export default class LoggerModule {}
