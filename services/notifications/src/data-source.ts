import dotenv from "dotenv";
import { join } from "path";
import PincodeDto from "src/dto/tables/pincodes.dto";
import SentNotificationsDto from "src/dto/tables/sent-notifications.dto";
import TelegramUsersDto from "src/dto/tables/telegram-users.dto";
import UsersDto from "src/dto/tables/users.dto";
import { DataSource } from "typeorm";

/**
 * Данная переменная устанавливается (прописывается) в команде запуска сервера, так что она уже инициализирована.
 * Так что нет нужны ее прописывать в .env файлах.
 */
const MODE = process.env.NODE_ENV as string;

/**
 * Загружаем .env.<mode> в зависимости от значения NODE_ENV.
 * Это делается для того, чтобы был резервный файл по умолчанию .env, из которого подтягивались переменные,
 * которые мы забыли указать/не указали в файлах вида .env.<mode>
 */
dotenv.config({ path: `.env.${MODE}` });
dotenv.config();

/**
 * Важно: Создавать миграции нужно командой: npm run migration:create src/migrations/<migration-name>
 * Запускать миграции можно командой: npm run migration:run
 * Откатывать последнюю миграцию можно командой: npm run migration:revert
 */

const {
	DATABASE_DIALECT,
	DATABASE_HOST,
	DATABASE_PORT,
	DATABASE_USERNAME,
	DATABASE_PASSWORD,
	DATABASE_NAME,
} = process.env;

// Экспорт DataSource для выполнения миграций через typeorm cli
export const AppDataSource = new DataSource({
	type: DATABASE_DIALECT as "mssql",
	host: DATABASE_HOST,
	port: Number(DATABASE_PORT),
	username: DATABASE_USERNAME,
	password: DATABASE_PASSWORD,
	database: DATABASE_NAME,
	entities: [SentNotificationsDto, PincodeDto, UsersDto, TelegramUsersDto],
	migrations: [
		join(__dirname, "./migrations/*.ts"),
		join(__dirname, "./migrations/*.js"),
	],
	migrationsTableName: "migrations",
	options:
		DATABASE_DIALECT === "mssql" ? { trustServerCertificate: true } : undefined,
});
