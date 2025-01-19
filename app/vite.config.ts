import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import browserslistToEsbuild from "browserslist-to-esbuild";
import path from "path";

// Vite автоматически поддерживает Typescript, поэтому дополнительных полей указывать не нужно.
// Vite также автоматически загружает env переменные в зависимости от NODE_ENV переменной, которая устанавливается при запуске команды npm run dev/build и тд.
// В этих командах NODE_ENV устанавливается автоматически.

export default defineConfig({
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            babel: {
                plugins: ["@emotion/babel-plugin"],
            }
        })                   // Определение плагина для React.js
    ],
    build: {
        outDir: "dist",      // Директория для сборки продакшен бандла
        target: browserslistToEsbuild([">0.2%", "not dead", "last 2 versions"])   // Установка browerlists
    },
    publicDir: "public",    // Директория для статичных файлов (дает возможность обращаться к картинках/шрифтам и тд прямиком из папки public)
    server: {
        open: true,         // Автоматически открывает браузер при запуске проекта
        port: 3000          // Порт локального сервера для разработки клиента
    },
    resolve: {
        alias: {
            "@components": path.resolve(__dirname, "src/components"),  // Короткий путь для папки component
            "@core": path.resolve(__dirname, "src/core"),              // Короткий путь для папки core
            "@hooks": path.resolve(__dirname, "src/hooks"),            // Короткий путь для папки hooks
            "@locales": path.resolve(__dirname, "src/locales"),        // Короткий путь для папки locales
            "@modules": path.resolve(__dirname, "src/modules"),        // Короткий путь для папки modules
            "@pages": path.resolve(__dirname, "src/pages"),            // Короткий путь для папки pages
            "@service": path.resolve(__dirname, "src/service"),        // Короткий путь для папки service
            "@store": path.resolve(__dirname, "src/store"),            // Короткий путь для папки store
            "@custom-types": path.resolve(__dirname, "src/types"),            // Короткий путь для папки types
            "@styles": path.resolve(__dirname, "src/styles"),          // Короткий путь для папки styles
            "@utils": path.resolve(__dirname, "src/utils")             // Короткий путь для папки utils
        }                   // Добавление коротких путей
    }
});