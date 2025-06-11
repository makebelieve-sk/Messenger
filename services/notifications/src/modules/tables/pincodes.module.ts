import PincodeService from "src/services/tables/pincodes.service";
import { Module } from "@nestjs/common";

@Module({
	providers: [PincodeService],
	exports: [PincodeService],
})
export default class PincodesModule {}
