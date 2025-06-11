import SentNotificationsService from "src/services/tables/sent-notifications.service";
import { Module } from "@nestjs/common";

@Module({
	providers: [SentNotificationsService],
	exports: [SentNotificationsService],
})
export default class SentNotificationsModule {}
