import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@locales/en.json";
import ru from "@locales/ru.json";

i18n
	.use(initReactI18next) // Интеграция с React
	.init({
		lng: navigator.language || "en", // Автоматическое определение языка в браузере пользователя
		fallbackLng: "ru", // Язык по умолчанию
		preload: [ "ru", "en" ], // Предзагрузка переводов
		interpolation: {
			escapeValue: false, // React сам экранирует HTML
		},
		resources: {
			ru: { translation: ru },
			en: { translation: en },
		},
	});

export default i18n;