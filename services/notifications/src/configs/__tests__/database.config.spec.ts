import databaseConfig, { DatabaseConfig } from "src/configs/database.config";
import PincodeDto from "src/dto/tables/pincodes.dto";
import SentNotificationsDto from "src/dto/tables/sent-notifications.dto";
import TelegramUsersDto from "src/dto/tables/telegram-users.dto";
import UsersDto from "src/dto/tables/users.dto";

describe("DatabaseConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = {
			...originalEnv,
			DATABASE_DIALECT: "mssql",
			DATABASE_HOST: "localhost",
			DATABASE_PORT: "1433",
			DATABASE_USERNAME: "test_user",
			DATABASE_PASSWORD: "test_password",
			DATABASE_NAME: "test_db",
		};
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should be defined", () => {
		expect(databaseConfig).toBeDefined();
	});

	it("should return correct database configuration", () => {
		const config = databaseConfig() as DatabaseConfig;

		expect(config).toEqual({
			type: "mssql",
			host: "localhost",
			port: 1433,
			username: "test_user",
			password: "test_password",
			database: "test_db",
			migrations: [
				"D:\\dev\\study\\my-messenger\\services\\notifications\\src\\migrations\\*.ts",
				"D:\\dev\\study\\my-messenger\\services\\notifications\\src\\migrations\\*.js",
			],
			migrationsTableName: "migrations",
			entities: [SentNotificationsDto, PincodeDto, UsersDto, TelegramUsersDto],
			options: { trustServerCertificate: true },
		});
	});

	it("should include all required entities", () => {
		const config = databaseConfig() as DatabaseConfig;

		expect(config.entities).toContain(SentNotificationsDto);
		expect(config.entities).toContain(PincodeDto);
		expect(config.entities).toContain(UsersDto);
		expect(config.entities).toContain(TelegramUsersDto);
	});

	it("should have correct migrations paths", () => {
		const config = databaseConfig() as DatabaseConfig;

		expect(config.migrations).toHaveLength(2);
		expect(config.migrations[0]).toContain(
			"D:\\dev\\study\\my-messenger\\services\\notifications\\src\\migrations\\*.ts",
		);
		expect(config.migrations[1]).toContain(
			"D:\\dev\\study\\my-messenger\\services\\notifications\\src\\migrations\\*.js",
		);
	});

	it("should have correct database options", () => {
		const config = databaseConfig() as DatabaseConfig;

		expect(config.options).toEqual({
			trustServerCertificate: true,
		});
	});
});
