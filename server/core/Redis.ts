import { createClient, RedisClientType } from "redis";
import { RedisStore } from "connect-redis";

import { ErrorTextsApi, RedisKeys } from "../types/enums";
import { TimeoutType } from "../types";
import { RedisError } from "../errors";

const REDIS_CONNECTION_URL = process.env.REDIS_CONNECTION_URL as string;
const REDIS_PREFIX = process.env.REDIS_PREFIX as string;
const REDIS_TTL = parseInt(process.env.REDIS_TTL as string);
const REDIS_TIMEOUT_RECONNECTION = parseInt(process.env.REDIS_TIMEOUT_RECONNECTION as string);

// Класс, отвечает за работу с клиентом Redis. Также, содержит внутри себя сущность хранилища RedisStore
export default class RedisWorks {
    private _client!: RedisClientType;
    private _redisStore!: RedisStore;
    private _timeoutReconnect!: TimeoutType;

    constructor() {
        this._connectRedis();
    }

    get redisClient() {
        return this._client;
    }

    get redisStore() {
        return this._redisStore;
    }

    private _connectRedis() {
        this._client = createClient({
            url: REDIS_CONNECTION_URL,   // URL-адрес для подключения к Redis серверу
        });
        this._client
            .connect()
            .catch(async (error: Error) => await this._errorHandler(ErrorTextsApi.ERROR_IN_CLIENT_CONNECT + error.message, true));

        this._redisStore = new RedisStore({ 
            client: this._client,   // Клиент Redis
            prefix: REDIS_PREFIX,   // Префикс ключа по умолчанию
            ttl: REDIS_TTL          // Устанавливаем начальное время жизни записи в хранилище
        });

        this._bindListeners();
    }

    private _bindListeners() {
        this.redisClient.on("connect", this._connectHandler);
        this.redisClient.on("ready", this._readyHandler);
        this.redisClient.on("error", async (error: Error) => await this._errorHandler(ErrorTextsApi.ERROR_IN_CLIENT_WORK + error.message, true));
        this.redisClient.on("end", this._endHandler);
    }

    private _connectHandler() {
        console.log("Соединение с клиентом Redis успешно установлено");
    }

    private _readyHandler() {
        console.log("Клиент Redis готов к работе");
    }

    private async _errorHandler(errorText: string, close: boolean = false) {
        new RedisError(errorText);

        if (close) await this.close();
    }

    private _endHandler() {
        console.log("Клиент Redis остановлен");

        if (this._timeoutReconnect) {
            clearTimeout(this._timeoutReconnect);
        }

        this._timeoutReconnect = setTimeout(() => {
            console.log("Клиент Redis переподключается...");
            this._connectRedis();
        }, REDIS_TIMEOUT_RECONNECTION);
    }

    async close() {
        await this._client.disconnect();
    }

    // Получить полный ключ сохраненного значения
    getKey(key: RedisKeys, id: string) {
        return `${key}:${id}`;
    };

    // Получение значения по ключу
    async get(redisKey: RedisKeys, id: string): Promise<string | number | boolean | null | void> {
        const key = this.getKey(redisKey, id);

        return await this._client
            .get(key)
            .then(result => result ? JSON.parse(result) : null)
            .catch((error: Error) => {
                this._errorHandler(`Произошла ошибка при получении значения по ключу [${key}] из Redis: ${error.message}`);
            });
    };

    // Запись значения по ключу
    async set(redisKey: RedisKeys, id: string, value: string) {
        const key = this.getKey(redisKey, id);

        await this._client
            .set(key, value)
            .then(() => console.log(`Новая пара [${key}:${value}] успешно записана в Redis`))
            .catch((error: Error) => {
                this._errorHandler(`Произошла ошибка при записи новой пары [${key}:${value}] в Redis: ${error.message}`);
            });
    };

    // Удаление значения по ключу
    async delete(redisKey: RedisKeys, id: string) {
        const key = this.getKey(redisKey, id);

        await this._client
            .del(key)
            .then(() => console.log(`Ключ [${key}] успешно удален из Redis`))
            .catch((error: Error) => {
                this._errorHandler(`Произошла ошибка при удалении ключа [${key}] из Redis: ${error.message}`);
            });
    };
};