// Основная абстрактная ошибка сервиса
export default abstract class BaseError extends Error {
	abstract readonly code: string;
	abstract readonly status: number;

	constructor(message?: string) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
	}
}
