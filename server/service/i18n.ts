import i18next from "i18next";
import middleware from "i18next-http-middleware";

import Logger from "@service/logger";
import { BaseError } from "@errors/index";
import en from "@locales/en.json";
import ru from "@locales/ru.json";

const logger = Logger("i18");

function initI18n(cb: Function) {
  logger.debug("initI18n");

  // Настройка интернациональности
  i18next
    .use(middleware.LanguageDetector)         // Middleware для автоматического определения языка пользователя из заголовков запроса (Accept-Language и тп)
    .init({
      fallbackLng: "ru",                      // Язык по умолчанию
      preload: ["ru", "en"],                  // Предзагрузка переводов
      resources: {
        ru: { translation: ru },
        en: { translation: en },
      }
    }, (error: Error) => {
      if (error) {
        new BaseError(`${t("error.initialize_i18n")}: ${error.message}`);
        process.exit(1);
      }

      cb();
    });
}

const t = (key: string, options: Record<string, string> = {}) => i18next.t(key, options);

export { initI18n, t };