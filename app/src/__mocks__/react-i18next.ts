import enTranslations from "@locales/en.json";

export const useTranslation = () => ({
	t: (key: string) => {
		const keys = key.split(".");
		let value = enTranslations;
		
		for (const k of keys) {
			value = value[k];
			if (value === undefined) return key;
		}
		
		return value;
	},
	i18n: {
		changeLanguage: jest.fn(),
		use: jest.fn().mockReturnThis(),
		init: jest.fn(),
	},
});

export const initReactI18next = {
	type: "3rdParty",
	init: jest.fn(),
};