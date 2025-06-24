import TelegramUsersDto from "src/dto/tables/telegram-users.dto";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
	imports: [TypeOrmModule.forFeature([TelegramUsersDto])],
	providers: [TelegramUsersService],
	exports: [TelegramUsersService],
})
export default class TelegramUsersModule {}
