import SentNotificationsDto from "src/dto/tables/sent-notifications.dto";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
	imports: [TypeOrmModule.forFeature([SentNotificationsDto])],
	providers: [SentNotificationsService],
	exports: [SentNotificationsService],
})
export default class SentNotificationsModule {}
