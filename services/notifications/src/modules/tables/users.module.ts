import UsersDto from "src/dto/tables/users.dto";
import UsersService from "src/services/tables/users.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
	imports: [TypeOrmModule.forFeature([UsersDto])],
	providers: [UsersService],
	exports: [UsersService],
})
export default class UsersModule {}
