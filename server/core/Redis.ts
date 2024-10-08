import { createClient } from "redis";
import RedisStore from "connect-redis";

import { RedisKeys } from "../types/enums";
import { TimeoutType } from "../types";

export type RedisClient = ReturnType<typeof createClient>;
export type RedisStoreType = ReturnType<typeof RedisStore>;

const REDIS_CONNECTION_URL = process.env.REDIS_CONNECTION_URL || "redis://localhost:6379";
const REDIS_TIMEOUT_RECONNECTION = process.env.REDIS_TIMEOUT_RECONNECTION
    ? JSON.parse(process.env.REDIS_TIMEOUT_RECONNECTION)
    : 5000;

export default class RedisWorks {
    private _client: RedisClient;
    private readonly _redisStore: RedisStoreType;
    private _timeoutReconnect!: TimeoutType;

    constructor() {
        this._client = createClient({
            url: REDIS_CONNECTION_URL,
        });
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
        this.redisClient.on("connect", this._connectHandler);
        this.redisClient.on("ready", this._readyHandler);
        this.redisClient.on("error", async (error: string) => await this._errorHandler(error));
        this.redisClient.on("end", this._endHandler);
    }

    private _connectHandler() {
        console.log("Соединение с клиентом Redis успешно установлено");
    }

    private _readyHandler() {
        console.log("Клиент Redis готов к работе");
    }

    private async _errorHandler(error: string) {
        const errorText = "Ошибка в работе клиента Redis: " + error;
        console.log(errorText);

        await this.close();
    }

    private _endHandler() {
        console.log("Клиент Redis остановлен");

        if (this._timeoutReconnect) {
            clearTimeout(this._timeoutReconnect);
        }

        this._timeoutReconnect = setTimeout(() => {
            console.log("Клиент Redis переподключается...");

            this._client = createClient();
            this._client
                .connect()
                .catch(this._errorHandler);
        }, REDIS_TIMEOUT_RECONNECTION);
    }

    public async close() {
        await this.redisClient.disconnect();
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