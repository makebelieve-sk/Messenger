// Контракт, описывающий сервис AppService
export default interface AppInterface {
	healthcheck: () => boolean;
}
