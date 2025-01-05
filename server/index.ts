import express from "express";
import http from "http";
import "dotenv/config";

import MainServer from "./core/MainServer";
import { BaseError } from "./errors";
import { ErrorTextsApi } from "./types/enums";
import ProcessWorks from "./service/Process";

const PORT = parseInt(process.env.PORT as string);
const MODE = process.env.NODE_ENV as string;

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

// Добавляем глобальную обработку ошибок (синхронных/асинхронных). При этом, формируем отчеты с детальной информацией об ошибке 
new ProcessWorks();

init();