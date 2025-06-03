"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const cors_config_1 = __importDefault(require("@config/cors.config"));
const express_session_config_1 = __importDefault(require("@config/express-session.config"));
const express_static_config_1 = __importDefault(require("@config/express-static.config"));
const ApiServer_1 = __importDefault(require("@core/api/ApiServer"));
const UsersController_1 = __importDefault(require("@core/controllers/UsersController"));
const Database_1 = __importDefault(require("@core/database/Database"));
const Passport_1 = __importDefault(require("@core/Passport"));
const Redis_1 = __importDefault(require("@core/Redis"));
const Socket_1 = __importDefault(require("@core/socket/Socket"));
const logger_1 = __importDefault(require("@service/logger"));
const constants_1 = require("@utils/constants");
const logger = (0, logger_1.default)("MainServer");
// Класс, являющийся ядром бизнес логики приложения на стороне сервера.
class MainServer {
    constructor(_app, _server) {
        this._app = _app;
        this._server = _server;
        logger.debug("init");
        // Инициализация контроллера управления пользователями на сервере
        this._users = new UsersController_1.default();
        // Инициализируем работу базы данных (модели, отношения)
        this._database = new Database_1.default();
        // Инициализируем работу Redis
        this._redisWork = new Redis_1.default();
        // Инициализируем мидлвары Express
        this._useExpressMiddlewares();
        // Инициализируем работу Passport (мидлвары)
        this._passport = new Passport_1.default(this._app, this._database, this._users);
        // Инициализируем работу API
        new ApiServer_1.default(this._redisWork, this._app, this._users, this._database, this._passport.passport);
        // Инициализируем работу socket.io
        this._socket = new Socket_1.default(this._server, this._users, this._database, this._redisWork, this._session);
    }
    _useExpressMiddlewares() {
        // Инициализируем express-сессию для пользователей с хранилищем в Redis
        this._session = (0, express_session_1.default)((0, express_session_config_1.default)(this._redisWork.redisStore));
        this._app.use((0, cors_1.default)(cors_config_1.default)); // Инициализируем политику CORS
        this._app.use(express_1.default.json()); // Для парсинга json строки
        this._app.use((0, cookie_parser_1.default)()); // Парсим cookie (позволяет получить доступ к куки через req.cookie)
        this._app.use(this._session); // Используем конфигурацию сессии express-session
        /**
         * Указываем Express использовать папку assets для обслуживания статических файлов
         * (опции express.static необходимо прописывать каждому мидлвару в отдельности).
         */
        this._app.use(express_1.default.static(path_1.default.join(__dirname, "../", constants_1.ASSETS_DIR), express_static_config_1.default));
    }
    // Закрытие сервера
    async close() {
        logger.debug("close");
        await this._database.close();
        await this._redisWork.close();
        await this._socket.close();
    }
}
exports.default = MainServer;
//# sourceMappingURL=MainServer.js.map