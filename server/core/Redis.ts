import { createClient } from "redis";
import RedisStore from "connect-redis";
import { RedisKeys } from "../types/enums";

export type RedisClient = ReturnType<typeof createClient>;
export type RedisStoreType = ReturnType<typeof RedisStore>;

export default class RedisWorks {
    private _client: RedisClient;
    private _redisStore: RedisStoreType;

    constructor() {
        this._client = createClient();
        this._client
            .connect()
            .catch(error => this._errorHandler(error));

        this._redisStore = new (RedisStore as any)({ client: this.redisClient });
        this._bindListeners();
    }

    get redisClient() {
        return this._client;
    }

    get redisStore() {
        return this._redisStore;
    }

    private _bindListeners() {
        this.redisClient.on("connect", () => console.log("Соединение с клиентом Redis успешно установлено"));
        this.redisClient.on("reconnecting", () => console.log("Клиент Redis переподключается..."));
        this.redisClient.on("error", async error => await this._errorHandler(error));
        this.redisClient.on("end", () => console.log("Клиент Redis остановлен"));
    }

    private async _errorHandler(error: string) {
        const errorText = "Ошибка в работе клиента Redis: " + error;
        console.log(errorText);
        
        await this._disconnect();
    }

    private async _disconnect() {
        await this.redisClient.disconnect()
    }

    // Получить полный ключ сохраненного значения
    public getKey(key: RedisKeys, id: string) {
        return `${key}:${id}`;
    };

    // Получение значения по ключу
    public async get(redisKey: RedisKeys, id: string): Promise<string | number | boolean | null | void> {
        const key = this.getKey(redisKey, id);

        return await this.redisClient
            .get(key)
            .then(result => result ? JSON.parse(result) : null)
            .catch(async error => {
                const errorText = `Произошла ошибка при получении значения по ключу [${key}] из Redis: ${error}`;
                await this._errorHandler(errorText);
            });
    };

    // Запись значения по ключу
    public async set(redisKey: RedisKeys, id: string, value: string): Promise<void> {
        const key = this.getKey(redisKey, id);

        await this.redisClient
            .set(key, value)
            .then(() => console.log(`Новая пара [${key}:${value}] успешно записана в Redis`))
            .catch(async error => {
                const errorText = `Произошла ошибка при записи новой пары [${key}:${value}] в Redis: ${error}`;
                await this._errorHandler(errorText);
            });
    };

    // Удаление значения по ключу
    public async delete(redisKey: RedisKeys, id: string): Promise<void> {
        const key = this.getKey(redisKey, id);

        await this.redisClient
            .del(key)
            .then(() => console.log(`Ключ [${key}] успешно удален из Redis`))
            .catch(async error => {
                const errorText = `Произошла ошибка при удалении ключа [${key}] из Redis: ${error}`;
                await this._errorHandler(errorText);
            });
    };
};