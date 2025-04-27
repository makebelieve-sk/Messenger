/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true, // можно использовать expect без импорта
        environment: "jsdom", // для React-тестов
        setupFiles: "./vitest.setup.ts",
        coverage: {
            reporter: ["text", "json", "html"], // HTML и консольный отчёт
        },
        include: ["src/**/*.vitest.{test,spec}.{ts,tsx}"], // где искать тесты
        exclude: [
            "**/src/stories/**/*.{stories.ts,stories.tsx}", // исключаем все файлы .stories.ts и .stories.tsx
            "**/*.jest.*", // игнорируем jest-тесты
            "**/*.stories.*", // игнорируем stories в папках
        ],
    },
    resolve: {
        alias: {
            "@components": path.resolve(__dirname, "./src/components"),
            // ... и другие алиасы
        },
    },
});
