import express from "express";
import http from "http";
import "dotenv/config";

import MainServer from "./core/MainServer";
import { BaseError } from "./errors";
import { initI18n, t } from "./service/i18n";

const PORT = process.env.PORT as string;
const MODE = process.env.NODE_ENV as string;

// Запуск сервера
function init() {
    const app = express();
    const server = http.createServer(app);
    const mainServer = new MainServer(app, server);

    try {
        server.listen(PORT, () => console.log(t("server_started", { mode: MODE, port: PORT })));
    } catch (error) {
        new BaseError(`${t("start_server_error")}: ${error}`);

        // Закрываем соединение с бд, сокетом и редисом
        mainServer.close();
        // Завершаем выполнение процесса NodeJS
        process.exit(1);
    }
}

// Обработываем пробрасываемые исключения синхронного кода
process.on("uncaughtException", (error: Error) => {
    new BaseError(`${t("error.unhandled_sync")}: ${error.message}`);
    console.error(error.stack);

    // Завершаем выполнение процесса NodeJS
    process.exit(1);
});

// Обработываем пробрасываемые исключения асинхронного кода
process.on("unhandledRejection", (reason: string, promise: Promise<unknown>) => {
    new BaseError(`${t("error.unhandled_async")}: ${reason} (${promise})`);

    // Завершаем выполнение процесса NodeJS
    process.exit(1);
});

initI18n(init);