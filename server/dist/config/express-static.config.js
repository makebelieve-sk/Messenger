"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Конфигурация обработки статических файлов на сервере
const expressStaticConfig = {
    // Игнорируем передачу файлов, начинающихся с точки, например, .env, .gitignore и тд
    dotfiles: "ignore",
    // Задаем максимальное время жизни кеша со статическими файлами (то есть браузер кеширует данный файл по времени)
    maxAge: "1d",
    // Запрещаем Express искать другие маршруты в случае, если файл не найден
    fallthrough: true,
    // Добавляем заголовок Cache-Control в ответ для лучшего кеширования
    cacheControl: true,
};
exports.default = expressStaticConfig;
//# sourceMappingURL=express-static.config.js.map