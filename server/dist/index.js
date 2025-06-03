"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Необходимо подключить alias для всего приложения
// eslint-disable-next-line simple-import-sort/imports
require("./service/aliases");
require("@service/env");
require("@service/spawn-backup-process");
require("@service/delete-unused-files");
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const MainServer_1 = __importDefault(require("@core/MainServer"));
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const Process_1 = __importDefault(require("@service/Process"));
const index_1 = require("@errors/index");
const constants_1 = require("@utils/constants");
const fs_1 = __importDefault(require("fs"));
// Добавляем глобальную обработку ошибок (синхронных/асинхронных). При этом, формируем отчеты с детальной информацией об ошибке
const processWork = new Process_1.default();
const logger = (0, logger_1.default)();
// Запуск сервера
async function init() {
    const app = (0, express_1.default)();
    /**
     * Для development режима используем https сервер, для production режима используем http сервер.
     * Это необходимо, так как продакшен планируется запускать через nginx на платформе PaaS (Heroku/Vercel/Render/etc).
     * Именно nginx будет принимать запросы по порту 443 и перенаправлять их на внутренний порт 5000 по протоколу http.
     *
     * Для production режима мы могли бы тоже использовать обычный http сервер, но необходимо было научится правильно настраивать
     * https соединение для приложения как на сервере, так и на клиенте.
     *
     * При этом, важно понять, что в докере у нас есть два варианта запуска приложения, которые управляются новой переменной MESSANGER_ENV:
     * 1) stage - запуск приложения через https. Такой же запуск, как локальный (npm run start).
     * 2) production - запуск приложения через docker compose (http) для production режима.
     *
     * Также, переменная MESSANGER_ENV устанавливается равной development, если запускается локально (npm run start).
     */
    const server = constants_1.IS_HTTPS
        ? https_1.default.createServer({
            key: fs_1.default.readFileSync("./certs/localhost-key.pem"),
            cert: fs_1.default.readFileSync("./certs/localhost.pem"),
        }, app)
        : http_1.default.createServer(app);
    const mainServer = new MainServer_1.default(app, server);
    processWork.setServer(mainServer);
    try {
        server.listen(constants_1.PORT, () => logger.info((0, i18n_1.t)("server_started", { mode: constants_1.NODE_ENV, port: constants_1.PORT })));
    }
    catch (error) {
        new index_1.BaseError(`${(0, i18n_1.t)("start_server_error")}: ${error}`);
        await processWork.stopServerWithError();
    }
}
// Инициализируем интернационализацию на сервере и после запускаем сам сервер
(0, i18n_1.initI18n)(init);
//# sourceMappingURL=index.js.map