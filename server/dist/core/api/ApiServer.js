"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = __importDefault(require("@core/api/controllers/Auth"));
// import FilesController from "@core/api/controllers/Files";
const Friends_1 = __importDefault(require("@core/api/controllers/Friends"));
const Images_1 = __importDefault(require("@core/api/controllers/Images"));
const Main_1 = __importDefault(require("@core/api/controllers/Main"));
// import MessagesController from "@core/api/controllers/Messages";
const User_1 = __importDefault(require("@core/api/controllers/User"));
const Middleware_1 = __importDefault(require("@core/api/Middleware"));
const logger_1 = __importDefault(require("@service/logger"));
const logger = (0, logger_1.default)("ApiServer");
// Класс, отвечает за обработку HTTP-запросов от клиента
class ApiServer {
    constructor(_redisWork, _app, _users, _database, _passport) {
        this._redisWork = _redisWork;
        this._app = _app;
        this._users = _users;
        this._database = _database;
        this._passport = _passport;
        this._middleware = new Middleware_1.default(this._redisWork, this._app);
        this._init();
    }
    // Запуск контроллеров обработки API запросов
    _init() {
        logger.debug("init");
        // Общий мидлвар, добавляет ограничение на количество запросов для пользователя на всё API
        this._middleware.rateLimiter();
        new Auth_1.default(this._app, this._middleware, this._database, this._redisWork, this._passport, this._users);
        // Обязательно объявляем MainController позже AuthController, чтобы был доступен нормально статичный метод logout
        new Main_1.default(this._app, this._middleware, this._database);
        new Images_1.default(this._app, this._middleware, this._database);
        // new FilesController(this._app, this._middleware, this._database);
        new Friends_1.default(this._app, this._middleware, this._database, this._users);
        // new MessagesController(this._app, this._middleware, this._database);
        new User_1.default(this._app, this._middleware, this._database);
        // Общий мидлвар, ловит все ошибки, которые были вызваны в любом контроллере с помощью next(error)
        this._middleware.catch();
    }
}
exports.default = ApiServer;
//# sourceMappingURL=ApiServer.js.map