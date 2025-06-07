import { type RedisStore } from "connect-redis";
import { type CookieOptions } from "express-session";

import { COOKIE_NAME, EXPRESS_SESSION_DOMAIN, IS_HTTPS, SECRET_KEY } from "@utils/constants";

// Конфигурация сессий express-session
export default function expressSessionConfig(store: RedisStore) {
	return {
		store, // Место хранения сессий (выбран Redis)
		name: COOKIE_NAME, // Наименование сессии в хранилище
		secret: SECRET_KEY, // Секретный ключ для шифрования ключа и данных сессии
		cookie: {
			secure: IS_HTTPS, // Требует передачу куки только через протокол https
			httpOnly: true, // Доступна только через http/https
			domain: EXPRESS_SESSION_DOMAIN, // На каких доменах доступна куки с id сессии
			sameSite: "lax" as const, // Защита от CSRF атак
			/**
			 * Устанавливаем время жизни сессий только до закрытия браузера. 
			 * При входе перезаписываем. 
			 * При переоткрытии вкладки сессия восстанавливается
			 */
			maxAge: undefined,
		} satisfies CookieOptions,
		resave: true, // Пересохранение сессии (даже если она не была изменена) при каждом запросе
		rolling: true, // Продлевает maxAge при каждом новом запросе
		saveUninitialized: false, // Не помещает в store пустые сессии
		unset: "destroy" as const, // Удаляем сессию из хранилища при вызове req.session.destroy()
	};
}
