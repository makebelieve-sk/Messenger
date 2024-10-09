import express from "express";
import http from "http";
import "dotenv/config";

import MainServer from "./core/MainServer";

const PORT = process.env.PORT;
const MODE = process.env.NODE_ENV;

// Запуск сервера
function init() {
    const app = express();
    const server = http.createServer(app);
    const mainServer = new MainServer({ app, server });

    try {
        server.listen(PORT, () => console.log(`Экземпляр сервера запущен на порту: ${PORT} в режиме: ${MODE}`));
    } catch (error) {
        console.error(`Возникла ошибка при запуске экземпляра сервера: ${error}`);

        // Закрываем соединение с бд
        mainServer.close();
        // Завершаем выполнение процесса NodeJS
        process.exit(1);
    }
}

init();