"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const en_json_1 = __importDefault(require("@locales/en.json"));
const ru_json_1 = __importDefault(require("@locales/ru.json"));
// Конфигурация локализации
const i18nConfig = {
    fallbackLng: "ru", // Язык по умолчанию
    preload: ["ru", "en"], // Предзагрузка переводов
    resources: {
        ru: { translation: ru_json_1.default },
        en: { translation: en_json_1.default },
    }, // Список ресурсов для перевода
};
exports.default = i18nConfig;
//# sourceMappingURL=i18n.config.js.map