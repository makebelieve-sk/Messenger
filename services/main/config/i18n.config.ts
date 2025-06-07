import en from "@locales/en.json";
import ru from "@locales/ru.json";

// Конфигурация локализации
const i18nConfig = {
	fallbackLng: "ru", // Язык по умолчанию
	preload: [ "ru", "en" ], // Предзагрузка переводов
	resources: {
		ru: { translation: ru },
		en: { translation: en },
	}, // Список ресурсов для перевода
};

export default i18nConfig;
