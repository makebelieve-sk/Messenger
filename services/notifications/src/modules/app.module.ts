import { Module } from "@nestjs/common";

import { AppController } from "../controllers/app.controller";
import { AppService } from "../services/app.service";
import { NotificationModule } from "./notification.module";
import { NotificationType } from "../types/enums";

// Главный модуль сервера
@Module({
	imports: [
		NotificationModule.register({ strategy: NotificationType.EMAIL }),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}