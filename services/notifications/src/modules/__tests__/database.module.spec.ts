import { I18nService } from "nestjs-i18n";
import ConfigError from "src/errors/config.error";
import { CONFIG_TYPE } from "src/types/enums";
import { ConfigService } from "@nestjs/config";

describe("DatabaseModule factory", () => {
	// Мокаем конфиг и i18n
	const mockDatabaseConfig = {
		host: "localhost",
		port: 1433,
		username: "user",
		password: "pass",
		database: "db",
		type: "mssql",
	};

	const i18nServiceMock = {
		t: jest.fn((key) => {
			if (key === "database.errors.config_unavailable")
				return "Config unavailable";
			return key;
		}),
	} as unknown as I18nService;

	// Фабрика из модуля (вынесена сюда для теста)
	function databaseConfigFactory(
		configService: ConfigService,
		i18nService: I18nService,
	) {
		const databaseConfig = configService.get(CONFIG_TYPE.DATABASE);
		if (!databaseConfig) {
			throw new ConfigError(i18nService.t("database.errors.config_unavailable"));
		}
		return databaseConfig;
	}

	it("should return databaseConfig if available", () => {
		const configServiceMock = {
			get: jest
				.fn()
				.mockImplementation((key) =>
					key === CONFIG_TYPE.DATABASE ? mockDatabaseConfig : undefined,
				),
		} as unknown as ConfigService;

		const result = databaseConfigFactory(configServiceMock, i18nServiceMock);

		expect(result).toEqual(mockDatabaseConfig);
		expect(configServiceMock.get).toHaveBeenCalledWith(CONFIG_TYPE.DATABASE);
	});

	it("should throw ConfigError if databaseConfig is missing", () => {
		const configServiceMock = {
			get: jest.fn().mockReturnValue(undefined),
		} as unknown as ConfigService;

		expect(() =>
			databaseConfigFactory(configServiceMock, i18nServiceMock),
		).toThrow(ConfigError);
		expect(i18nServiceMock.t).toHaveBeenCalledWith(
			"database.errors.config_unavailable",
		);
	});
});
