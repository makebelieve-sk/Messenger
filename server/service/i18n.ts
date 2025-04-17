import i18next from "i18next";
import middleware from "i18next-http-middleware";

import i18nConfig from "@config/i18n.config";
import Logger from "@service/logger";
import { BaseError } from "@errors/index";

const logger = Logger("i18");

function initI18n(cb: Function) {
	logger.debug("initI18n");

	// Настройка интернациональности
	i18next
		// Middleware для автоматического определения языка пользователя из заголовков запроса (Accept-Language и тп)
		.use(middleware.LanguageDetector)
		.init(i18nConfig, (error: Error) => {
			if (error) {
				new BaseError(`${t("error.initialize_i18n")}: ${error.message}`);
				process.exit(1);
			}

			cb();
		});
}

const t = (key: string, options: Record<string, string> = {}) => i18next.t(key, options);

export { initI18n, t };
