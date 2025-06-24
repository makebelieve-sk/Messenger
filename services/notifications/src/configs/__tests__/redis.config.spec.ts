import redisConfig from "src/configs/redis.config";

describe("RedisConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it("should return correct config with environment variables", () => {
		// Arrange
		const mockHost = "localhost";
		const mockPort = "6379";
		process.env.REDIS_HOST = mockHost;
		process.env.REDIS_PORT = mockPort;

		// Act
		const config = redisConfig();

		// Assert
		expect(config).toEqual({
			transport: expect.any(Number), // Transport.REDIS
			options: {
				host: mockHost,
				port: parseInt(mockPort),
			},
		});
	});
});
