import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";

import { BaseError } from "../errors";

function initI18n(cb: Function) {
  // Настройка интернациональности
  i18next
    .use(Backend)                             // Подключаем backend для чтения файлов
    .use(middleware.LanguageDetector)         // Middleware для автоматического определения языка
    .init({
      fallbackLng: "ru",                      // Язык по умолчанию
      preload: ["ru", "en"],                  // Предзагрузка переводов
      backend: {
        loadPath: "./locales/{{lng}}.json"    // Путь к переводам
      }
    }, (error: Error) => {
      if (error) {
        new BaseError(`${t("error_when_initialize_i18n")}: ${error.message}`);
        process.exit(1);
      }

      cb();
    });
}

const t = (key: string, options: { [key: string]: string; } = {}) => i18next.t(key, options);

export { initI18n, t };