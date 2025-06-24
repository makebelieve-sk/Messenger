// Мокаем dotenv
jest.mock("dotenv", () => ({
	__esModule: true,
	default: { config: jest.fn() },
}));

describe("AppDataSource config", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
		process.env = { ...originalEnv };
		process.env.NODE_ENV = "test";
		process.env.DATABASE_DIALECT = "mssql";
		process.env.DATABASE_HOST = "localhost";
		process.env.DATABASE_PORT = "1433";
		process.env.DATABASE_USERNAME = "user";
		process.env.DATABASE_PASSWORD = "pass";
		process.env.DATABASE_NAME = "db";
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should call dotenv.config with correct paths", () => {
		jest.isolateModules(() => {
			require("src/data-source");
			const dotenvMock = require("dotenv").default;
			expect(dotenvMock.config).toHaveBeenCalledWith({
				path: `.env.${process.env.NODE_ENV}`,
			});
			expect(dotenvMock.config).toHaveBeenCalledWith();
		});
	});

	it("should create DataSource with correct options for mssql", () => {
		jest.isolateModules(() => {
			jest.mock("typeorm", () => {
				const original = jest.requireActual("typeorm");
				const DataSourceMock = jest.fn().mockImplementation((opts) => ({
					options: opts,
				}));
				return {
					...original,
					DataSource: DataSourceMock,
				};
			});

			const { AppDataSource } = require("src/data-source");
			const { DataSource: MockedDataSource } = require("typeorm");
			expect(MockedDataSource).toHaveBeenCalled();
			const options = AppDataSource.options;
			expect(options.type).toBe("mssql");
			expect(options.host).toBe("localhost");
			expect(options.port).toBe(1433);
			expect(options.username).toBe("user");
			expect(options.password).toBe("pass");
			expect(options.database).toBe("db");
			expect(options.entities).toHaveLength(4);
			expect(options.migrationsTableName).toBe("migrations");
			expect(options.options).toEqual({ trustServerCertificate: true });
		});
	});

	it("should not set options when dialect is not mssql", () => {
		process.env.DATABASE_DIALECT = "postgres";
		jest.isolateModules(() => {
			jest.mock("typeorm", () => {
				const original = jest.requireActual("typeorm");
				const DataSourceMock = jest.fn().mockImplementation((opts) => ({
					options: opts,
				}));
				return {
					...original,
					DataSource: DataSourceMock,
				};
			});

			const { AppDataSource } = require("src/data-source");
			const { DataSource: MockedDataSource } = require("typeorm");
			expect(MockedDataSource).toHaveBeenCalled();
			const options = AppDataSource.options;
			expect(options.options).toBeUndefined();
		});
	});
});
