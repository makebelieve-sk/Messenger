describe("i18n initialization", () => {
	const enTranslations = require("@locales/en.json");
	const ruTranslations = require("@locales/ru.json");

	const loadI18n = async () => {
		jest.resetModules();
		const module = await import("@service/i18n");
		return module.default;
	};

	beforeEach(() => {
		jest.resetModules();

		Object.defineProperty(global, "navigator", {
			value: {
				language: "en",
				languages: [ "en" ],
				userAgent: "test",
				platform: "test",
				vendor: "test",
			},
			writable: true,
		});
	});

	test("should load both translation bundles (en and ru)", async () => {
		Object.defineProperty(global.navigator, "language", { value: "en" });

		const i18n = await loadI18n();

		const enBundle = i18n.getResourceBundle("en", "translation");
		const ruBundle = i18n.getResourceBundle("ru", "translation");

		expect(Object.keys(enBundle).sort()).toEqual(Object.keys(enTranslations).sort());
		expect(Object.keys(ruBundle).sort()).toEqual(Object.keys(ruTranslations).sort());
	});

	test("if browser language matches \"en\", i18n.language should be \"en\"", async () => {
		Object.defineProperty(global.navigator, "language", { value: "en" });
		const i18n = await loadI18n();

		expect(i18n.language).toBe("en");
	});

	test("if browser language matches \"ru\", i18n.language should be \"ru\"", async () => {
		Object.defineProperty(global.navigator, "language", { value: "ru" });
		const i18n = await loadI18n();

		expect(i18n.language).toBe("ru");
	});

	test("if browser language is not supported (e.g. \"de\"), should fallback to fallbackLng (\"ru\") for translation", async () => {
		Object.defineProperty(global.navigator, "language", { value: "de" });
		const i18n = await loadI18n();
		const someKey = Object.keys(ruTranslations)[0];

		const translated = i18n.t(someKey);
		expect(translated).toBe(ruTranslations[someKey]);
	});

	test("translations for keys from en.json and ru.json should match the content of imported JSON files", async () => {
		const intersectKeys = Object.keys(enTranslations).filter(key =>
			Object.prototype.hasOwnProperty.call(ruTranslations, key),
		);
		if (intersectKeys.length === 0) {
			Object.defineProperty(global.navigator, "language", { value: "en" });
			const i18n = await loadI18n();
			const keyEnOnly = Object.keys(enTranslations)[0];
			expect(i18n.t(keyEnOnly)).toBe(enTranslations[keyEnOnly]);
			return;
		}

		const sampleKey = intersectKeys[0];

		Object.defineProperty(global.navigator, "language", { value: "en" });
		let i18n = await loadI18n();
		expect(i18n.t(sampleKey)).toBe(enTranslations[sampleKey]);

		Object.defineProperty(global.navigator, "language", { value: "ru" });
		i18n = await loadI18n();
		expect(i18n.t(sampleKey)).toBe(ruTranslations[sampleKey]);
	});
});
