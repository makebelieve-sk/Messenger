import express from "express";
import http from "http";

import MainServer from "@core/MainServer";
import { initI18n, t } from "@service/i18n";
import Logger from "@service/logger";
import ProcessWorks from "@service/Process";
import { BaseError } from "@errors/index";

// Необходимо подключить alias для всего приложения
import "./service/aliases";
import "@service/env";

const logger = Logger();
const PORT = process.env.PORT as string;
const MODE = process.env.NODE_ENV as string;

// Запуск сервера
function init() {
    const app = express();
    const server = http.createServer(app);
    const mainServer = new MainServer(app, server);

    try {
        server.listen(PORT, () => logger.info(t("server_started", { mode: MODE, port: PORT })));
    } catch (error) {
        new BaseError(`${t("start_server_error")}: ${error}`);

        // Закрываем соединение с бд, сокетом и редисом
        mainServer.close();
        // Завершаем выполнение процесса NodeJS
        process.exit(1);
    }
}

// Добавляем глобальную обработку ошибок (синхронных/асинхронных). При этом, формируем отчеты с детальной информацией об ошибке 
new ProcessWorks();
// Инициализируем интернационализацию на сервере и после запустить его
initI18n(init);