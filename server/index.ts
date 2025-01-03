import express from "express";
import http from "http";
import "dotenv/config";

import MainServer from "./core/MainServer";
import { BaseError } from "./errors";
import { ErrorTextsApi } from "./types/enums";

const PORT = process.env.PORT;
const MODE = process.env.NODE_ENV;

// Запуск сервера
function init() {
    const app = express();
    const server = http.createServer(app);
    const mainServer = new MainServer(app, server);

    try {
        server.listen(PORT, () => console.log(`Экземпляр сервера запущен на порту: ${PORT} в режиме: ${MODE}`));
    } catch (error) {
        new BaseError(`${ErrorTextsApi.START_SERVER_ERROR}: ${error}`);

        // Закрываем соединение с бд, сокетом и редисом
        mainServer.close();
        // Завершаем выполнение процесса NodeJS
        process.exit(1);
    }
}

// Обработываем пробрасываемые исключения синхронного кода
process.on("uncaughtException", (error: Error) => {
    new BaseError(`${ErrorTextsApi.UNHANDLED_SYNC_ERROR}: ${error.message}`);

    // Завершаем выполнение процесса NodeJS
    process.exit(1);
});

// Обработываем пробрасываемые исключения асинхронного кода
process.on("unhandledRejection", (reason: string, promise: Promise<unknown>) => {
    new BaseError(`${ErrorTextsApi.UNHANDLED_ASYNC_ERROR}: ${reason} (${promise})`);

    // Завершаем выполнение процесса NodeJS
    process.exit(1);
});

init();