"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eslint_plugin_import_1 = __importDefault(require("eslint-plugin-import"));
const eslint_plugin_simple_import_sort_1 = __importDefault(require("eslint-plugin-simple-import-sort"));
const path_1 = __importDefault(require("path"));
const eslint_plugin_1 = __importDefault(require("@typescript-eslint/eslint-plugin"));
const parser_1 = __importDefault(require("@typescript-eslint/parser"));
const eslintConfig = require(path_1.default.resolve(__dirname, "../.eslint.config.ts")).default;
exports.default = [
    {
        // Глобальные игноры (должны быть в первом конфиге)
        ignores: ["**/dist/**", "**/node_modules/**", "**/dumps/**"],
    },
    eslintConfig, // Абсолютный путь к общему конфигу
    {
        files: ["**/*.ts"], // Указываем, что проверяются только файлы TypeScript
        languageOptions: {
            ecmaVersion: "latest", // Уровень ECMAScript
            sourceType: "module", // Используем модули
            parser: parser_1.default, // Указываем TypeScript как парсер
        },
        plugins: {
            "@typescript-eslint": eslint_plugin_1.default, // Подключение плагина для Typescript
            import: eslint_plugin_import_1.default, // Подключение плагина для корректных импортов
            "simple-import-sort": eslint_plugin_simple_import_sort_1.default, // Подключение дополнительного плагина для управления импортами
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "argsIgnorePattern": "_", // Игнорировать аргументы, начинающиеся с _
                    "varsIgnorePattern": "_", // Игнорировать переменные, начинающиеся с _
                },
            ], // Предупреждать о неиспользуемых переменных
            "@typescript-eslint/no-explicit-any": "warn", // Предупреждать об использовании "any"
            "@typescript-eslint/ban-ts-comment": "warn", // Предупреждать о лишних комментариях "@ts-ignore"
            "import/newline-after-import": ["error", { count: 1 }], // Обязательная пустая строка после импорта
            "import/first": "error", // Вынос строк импортов в начало файла
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        // 1. Встроенные модули и зависимости из node_modules
                        ["^node:", "^[a-z0-9]", "^@?\\w"], // fs, express и т.д.
                        // 2. Алиасы всех указанных файлов. Также, относительные импорты (../components, ./utils)
                        ["^@config", "^@core", "^@service", "^@errors", "^@locales", "^@migrations", "^@custom-types", "^@utils"],
                    ],
                },
            ],
        },
        settings: {
            "import/resolver": {
                typescript: {
                    project: "./tsconfig.json", // Указываем путь к tsconfig.json
                },
            },
        },
        ignores: ["node_modules", "dist"],
    },
];
//# sourceMappingURL=eslint.config.js.map