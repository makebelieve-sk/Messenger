import PincodesDto from "src/dto/tables/pincodes.dto";
import PincodesService from "src/services/tables/pincodes.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
	imports: [TypeOrmModule.forFeature([PincodesDto])],
	providers: [PincodesService],
	exports: [PincodesService],
})
export default class PincodesModule {}
