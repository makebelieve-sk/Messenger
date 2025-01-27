import ts from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

export default [
    // Общая конфигурация для всех файлов
    {
        files: ["**/*.{ts,tsx}"],           // Проверяем только нужные файлы
        languageOptions: {
            ecmaVersion: "latest",          // Последняя версия ECMAScript
            sourceType: "module",           // Поддержка модулей ES
            parser,                         // Используем TypeScript-парсер
            parserOptions: {
                    ecmaFeatures: {
                    jsx: true               // Поддержка JSX
                }
            }                               // Добавляем поддержку браузерных глобальных объектов
        },
        plugins: {
            "@typescript-eslint": ts,       // Подключаем плагин для TypeScript
        },
        rules: {
            // Ваши кастомные правила
            "@typescript-eslint/no-unused-vars": ["warn"],                  // Предупреждать о неиспользуемых переменных
            "@typescript-eslint/explicit-function-return-type": "off",      // Не требовать явного указания возвращаемого типа
            "@typescript-eslint/no-explicit-any": "off",                    // Предупреждать об использовании "any" (в будущем можно пометить как ignore - "warn")
            "@typescript-eslint/ban-ts-comment": "warn",                    // Предупреждать о лишних комментариях "@ts-ignore"
            "no-console": "off",                                            // Предупреждать об использовании "console.log" (в будущем после логгера можно использовать - "warn")
            "quotes": ["error", "double"],                                  // Использовать двойные кавычки
        }
    },
    // Дополнительная конфигурация для конфигурационных файлов
    {
        files: ["vite.config.ts"],
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module"
            }
        },
        rules: {
            "no-console": "off"           // Разрешаем консоль в конфигурациях
        }
    }
];