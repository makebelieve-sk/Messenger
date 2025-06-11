// Список обязательных env переменных
const ENV_VARS = [
	"PORT",
	"NODE_ENV",
	"RABBITMQ_URL",
	"REDIS_PORT",
	"REDIS_HOST",
	"DATABASE_NAME",
	"DATABASE_USERNAME",
	"DATABASE_PASSWORD",
	"DATABASE_HOST",
	"DATABASE_PORT",
];

// Валидация .env переменных
export default function validateEnv(env: Record<string, string>) {
	const missing = ENV_VARS.filter((key) => !env[key]);

	if (missing.length) {
		throw new Error(`Missing env vars: ${missing.join(", ")}`);
	}

	return env;
}
