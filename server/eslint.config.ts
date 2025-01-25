import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default {
    files: ["**/*.ts"],                                 // Указываем, что проверяются только файлы TypeScript
    languageOptions: {
        ecmaVersion: "latest",                          // Уровень ECMAScript
        sourceType: "module",                           // Используем модули
        parser: tsParser                                // Указываем TypeScript как парсер
    },
    plugins: {
        "@typescript-eslint": tsPlugin
    },
    rules: {
        "no-console": "off",                            // Предупреждать об использовании "console.log" (в будущем после логгера можно использовать - "warn")
        "@typescript-eslint/no-unused-vars": ["warn"],  // Предупреждать о неиспользуемых переменных
        "@typescript-eslint/no-explicit-any": "off",    // Предупреждать об использовании "any" (в будущем можно пометить как ignore - "warn")
        "@typescript-eslint/ban-ts-comment": "warn",    // Предупреждать о лишних комментариях "@ts-ignore"
        "quotes": ["error", "double"]                   // Использовать двойные кавычки
    },
    ignores: ["node_modules", "dist"],
};