import validateEnv from "src/utils/validate-env";

describe("validateEnv", () => {
	it("should return env object when all required variables are present", () => {
		const env = {
			PORT: "3000",
			NODE_ENV: "development",
			RABBITMQ_URL: "amqp://localhost",
			REDIS_PORT: "6379",
			REDIS_HOST: "localhost",
			DATABASE_NAME: "testdb",
			DATABASE_USERNAME: "user",
			DATABASE_PASSWORD: "password",
			DATABASE_HOST: "localhost",
			DATABASE_PORT: "5432",
		};

		const result = validateEnv(env);
		expect(result).toEqual(env);
	});

	it("should throw error when some required variables are missing", () => {
		const env = {
			PORT: "3000",
			NODE_ENV: "development",
			// Missing RABBITMQ_URL
			REDIS_PORT: "6379",
			REDIS_HOST: "localhost",
			DATABASE_NAME: "testdb",
			DATABASE_USERNAME: "user",
			DATABASE_PASSWORD: "password",
			DATABASE_HOST: "localhost",
			DATABASE_PORT: "5432",
		};

		expect(() => validateEnv(env)).toThrow("Missing env vars: RABBITMQ_URL");
	});

	it("should throw error when multiple required variables are missing", () => {
		const env = {
			PORT: "3000",
			NODE_ENV: "development",
			// Missing multiple variables
		};

		expect(() => validateEnv(env)).toThrow(
			"Missing env vars: RABBITMQ_URL, REDIS_PORT, REDIS_HOST, DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT",
		);
	});

	it("should throw error when all required variables are missing", () => {
		const env = {};

		expect(() => validateEnv(env)).toThrow(
			"Missing env vars: PORT, NODE_ENV, RABBITMQ_URL, REDIS_PORT, REDIS_HOST, DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT",
		);
	});
});
