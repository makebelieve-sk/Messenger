"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect_redis_1 = require("connect-redis");
const redis_1 = require("redis");
const redis_config_1 = __importDefault(require("@config/redis.config"));
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const index_1 = require("@errors/index");
const constants_1 = require("@utils/constants");
const logger = (0, logger_1.default)("Redis");
// Класс, отвечает за работу с клиентом Redis. Также, содержит внутри себя сущность хранилища RedisStore
class RedisWorks {
    constructor() {
        this._connectRedis();
    }
    get redisClient() {
        return this._client;
    }
    get redisStore() {
        return this._redisStore;
    }
    _connectRedis() {
        logger.debug("init");
        this._client = (0, redis_1.createClient)(redis_config_1.default.client);
        this._client.connect().catch(async (error) => await this._connectErrorHandler((0, i18n_1.t)("redis.error.client_connect") + error.message));
        this._redisStore = new connect_redis_1.RedisStore(redis_config_1.default.store(this._client));
        this._bindListeners();
    }
    _bindListeners() {
        this.redisClient.on("connect", this._connectHandler);
        this.redisClient.on("ready", this._readyHandler);
        this.redisClient.on("error", async (error) => await this._connectErrorHandler((0, i18n_1.t)("redis.error.client_work") + error.message));
        this.redisClient.on("end", this._endHandler);
    }
    _connectHandler() {
        logger.info((0, i18n_1.t)("redis.connection_successfull"));
    }
    _readyHandler() {
        logger.info((0, i18n_1.t)("redis.start_to_work"));
    }
    async _connectErrorHandler(errorText) {
        this._errorHandler(errorText);
        await this.close();
        if (this._timeoutReconnect) {
            clearTimeout(this._timeoutReconnect);
        }
        this._timeoutReconnect = setTimeout(() => {
            logger.info((0, i18n_1.t)("redis.reconnection"));
            this._connectRedis();
        }, constants_1.REDIS_TIMEOUT_RECONNECTION);
    }
    _errorHandler(errorText) {
        new index_1.RedisError(errorText);
    }
    _endHandler() {
        logger.info((0, i18n_1.t)("redis.stopped"));
    }
    async close() {
        logger.debug("close");
        await this._client.disconnect();
    }
    // Получить полный ключ сохраненного значения
    getKey(key, id) {
        return `${key}:${id}`;
    }
    // Обновление времени жизни записи по ключу
    async expire(redisKey, id, ttl = constants_1.REDIS_TTL) {
        const key = this.getKey(redisKey, id);
        await this._client
            .expire(key, ttl)
            .then(() => logger.info((0, i18n_1.t)("redis.ttl_update", { ttl: ttl.toString(), key })))
            .catch((error) => {
            this._errorHandler((0, i18n_1.t)("redis.error.ttl_update", { key, message: error.message }));
        });
    }
    // Получение значения по ключу
    async get(redisKey, id) {
        logger.debug("get [redisKey=%s, id=%s]", redisKey, id);
        const key = this.getKey(redisKey, id);
        return await this._client
            .get(key)
            .then(result => (result ? JSON.parse(result) : null))
            .catch((error) => {
            this._errorHandler(`${(0, i18n_1.t)("redis.error.get_value", { key })}: ${error.message}`);
        });
    }
    // Запись значения по ключу
    async set(redisKey, id, value) {
        logger.debug("set [redisKey=%s, id=%s]", redisKey, id);
        const key = this.getKey(redisKey, id);
        await this._client
            .set(key, value)
            .then(() => logger.info((0, i18n_1.t)("redis.new_pair_is_set", { key, value })))
            .catch((error) => {
            this._errorHandler(`${(0, i18n_1.t)("redis.error.setting_new_pair", { key, value })}: ${error.message}`);
        });
    }
    // Удаление значения по ключу
    async delete(redisKey, id) {
        logger.debug("delete [redisKey=%s, id=%s]", redisKey, id);
        const key = this.getKey(redisKey, id);
        await this._client
            .del(key)
            .then(() => logger.info((0, i18n_1.t)("redis.key_successfull_deleted", { key })))
            .catch((error) => {
            this._errorHandler(`${(0, i18n_1.t)("redis.error.deleted_key", { key })}: ${error.message}`);
        });
    }
}
exports.default = RedisWorks;
//# sourceMappingURL=Redis.js.map