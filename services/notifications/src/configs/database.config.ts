import SentNotificationsDto from "src/dto/tables/sent-notifications.dto";
import { CONFIG_TYPE } from "src/types/enums";
import { registerAs } from "@nestjs/config";
import PincodeDto from "src/dto/tables/pincodes.dto";
import { join } from "path";

export interface DatabaseConfig {
	type: "mssql";
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
	migrations: string[];
	migrationsTableName?: string;
	entities: (typeof SentNotificationsDto | typeof PincodeDto)[];
	options: {
		trustServerCertificate: boolean;
	};
}

// Гененрация конфига Database с env переменными (Используется только для запуска миграций)
const databaseConfig = registerAs<DatabaseConfig>(CONFIG_TYPE.DATABASE, () => ({
	type: process.env.DATABASE_DIALECT as "mssql",
	host: process.env.DATABASE_HOST as string,
	port: parseInt(process.env.DATABASE_PORT as string),
	username: process.env.DATABASE_USERNAME as string,
	password: process.env.DATABASE_PASSWORD as string,
	database: process.env.DATABASE_NAME as string,
	migrations: [
		join(__dirname, '../migrations/*.ts'),
        join(__dirname, '../migrations/*.js'),
	],
	migrationsTableName: 'migrations',
	entities: [SentNotificationsDto, PincodeDto],
	options: { trustServerCertificate: true },
}));

export default databaseConfig;
