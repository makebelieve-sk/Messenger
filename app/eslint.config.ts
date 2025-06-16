import ts from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import path from "path";
import importPlugin from "eslint-plugin-import";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import storybookPlugin from "eslint-plugin-storybook";
import reactPlugin from "eslint-plugin-react";

const eslintConfig = require(path.resolve(__dirname, "../.eslint.config.ts")).default;

export default [
	eslintConfig, // Абсолютный путь к общему конфигу
	// Общая конфигурация для файлов Storybook
	{
		files: ["**/*.stories.@(js|jsx|ts|tsx)"],
		plugins: {
			storybook: storybookPlugin,
		},
	},
	// Общая конфигурация для всех файлов
	{
		files: ["**/*.{ts,tsx}"], // Проверяем только нужные файлы
		languageOptions: {
			globals: {
				browser: true,
				es2021: true,
				node: true,
			},
			parser, // Используем TypeScript-парсер
			parserOptions: {
				ecmaFeatures: {
					jsx: true, // Поддержка JSX
				},
				project: "./tsconfig.json", // Используем tsconfig.json (для активации проверки tsc при линтинге)
				tsconfigRootDir: __dirname, // Чтобы ESLint знал, откуда искать tsconfig
			}, // Добавляем поддержку браузерных глобальных объектов
		},
		plugins: {
			react: reactPlugin, // Подключаем плагин для React
			"@typescript-eslint": ts, // Подключаем плагин для TypeScript
			import: importPlugin, // Подключение плагина для корректных импортов
			"simple-import-sort": simpleImportSortPlugin, // Подключение дополнительного плагина для управления импортами
		},
		settings: {
			react: {
				version: "detect" // Автоматически определяет версию React
			}
		},
		rules: {
			"react/jsx-uses-react": "warn",				// Обнаруживает неиспользованный импорт React
			"react/jsx-uses-vars": "warn",				// Обнаруживает неиспользованные переменные в JSX
			"react/jsx-no-undef": "warn",				// Обнаруживает неопределённые компоненты/переменные в JSX
			"react/jsx-key": "warn",					// Убеждается, что элементы в массивах имеют уникальный key
			"react/jsx-fragments": "warn",				// Убеждается, что JSX-фрагменты используются правильно
			"react/jsx-no-duplicate-props": "warn",		// Обнаруживает дублирующиеся свойства в JSX
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					"argsIgnorePattern": "_",                          // Игнорировать аргументы, начинающиеся с _
					"varsIgnorePattern": "_",                          // Игнорировать переменные, начинающиеся с _
				},
			],                                                         // Предупреждать о неиспользуемых переменных
			"@typescript-eslint/no-explicit-any": "warn",              // Предупреждать об использовании "any"
			"@typescript-eslint/ban-ts-comment": "warn",               // Предупреждать о лишних комментариях "@ts-ignore"
			"@typescript-eslint/explicit-function-return-type": "off", // Не требовать явного указания возвращаемого типа
			"import/newline-after-import": ["warn", { count: 1 }],   // Обязательная пустая строка после импорта
			"import/first": "warn",                                    // Вынос строк импортов в начало файла
			"simple-import-sort/imports": [
				"warn",
				{
					groups: [
						// 1. Встроенные модули и зависимости из node_modules
						["^[a-z0-9]", "^@?\\w"], // react, zustand и т.д.
						// 2. Алиасы всех указанных файлов. Также, относительные импорты (../components, ./utils)
						[
							"^@components",
							"^@core",
							"^@hooks",
							"^@locales",
							"^@modules",
							"^@pages",
							"^@service",
							"^@store",
							"^@custom-types",
							"^@utils",
							"^\\.\\.?/",
						],
						// 3. Стили
						["^@styles"],
					],
				},
			],
		},
	},
	// Дополнительная конфигурация для конфигурационных файлов
	{
		files: ["vite.config.ts"],
	},
];