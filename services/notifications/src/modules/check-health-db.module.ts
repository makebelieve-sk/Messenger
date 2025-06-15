import RabbitMQModule from "src/modules/rabbitmq.module";
import PincodesModule from "src/modules/tables/pincodes.module";
import CheckHealthDatabaseService from "src/services/check-health-db.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

// Модуль проверки здоровья базы данных
@Module({
	imports: [TypeOrmModule, RabbitMQModule, PincodesModule],
	providers: [CheckHealthDatabaseService],
})
export default class CheckHealthDatabaseModule {}
