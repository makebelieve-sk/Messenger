"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = expressSessionConfig;
const constants_1 = require("@utils/constants");
// Конфигурация сессий express-session
function expressSessionConfig(store) {
    return {
        store, // Место хранения сессий (выбран Redis)
        name: constants_1.COOKIE_NAME, // Наименование сессии в хранилище
        secret: constants_1.SECRET_KEY, // Секретный ключ для шифрования ключа и данных сессии
        cookie: {
            secure: constants_1.IS_HTTPS, // Требует передачу куки только через протокол https
            httpOnly: true, // Доступна только через http/https
            domain: constants_1.EXPRESS_SESSION_DOMAIN, // На каких доменах доступна куки с id сессии
            sameSite: "lax", // Защита от CSRF атак
            /**
             * Устанавливаем время жизни сессий только до закрытия браузера.
             * При входе перезаписываем.
             * При переоткрытии вкладки сессия восстанавливается
             */
            maxAge: undefined,
        },
        resave: true, // Пересохранение сессии (даже если она не была изменена) при каждом запросе
        rolling: true, // Продлевает maxAge при каждом новом запросе
        saveUninitialized: false, // Не помещает в store пустые сессии
        unset: "destroy", // Удаляем сессию из хранилища при вызове req.session.destroy()
    };
}
//# sourceMappingURL=express-session.config.js.map