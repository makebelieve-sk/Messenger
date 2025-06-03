import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import browserslistToEsbuild from "browserslist-to-esbuild";
import path from "path";
import checker from "vite-plugin-checker";
import fs from "fs";

/**
 * Vite автоматически поддерживает Typescript, поэтому дополнительных полей указывать не нужно.
 * Vite также автоматически загружает env переменные в зависимости от NODE_ENV переменной, которая устанавливается при запуске команды npm run start/build и тд.
 * В этих командах NODE_ENV устанавливается автоматически.
 */

export default defineConfig(({ mode }) => {
    return {
        plugins: [
            // Формирует отчеты статистики о размерах чанков итоговой сборки
            visualizer({
                filename: "dist/stats.html",    // Путь для отчёта
                open: true,                     // Автоматически открывает отчёт после сборки
                gzipSize: true,                 // Показывает gzip размеры
                brotliSize: true,               // Показывает brotli размеры
            }),
            react({
                jsxImportSource: "@emotion/react",
                babel: {
                    plugins: ["@emotion/babel-plugin"],
                }
            }),                  // Определение плагина для React.js
            mode === "development" ? checker({
                typescript: true,
                enableBuild: true
            }) : undefined, // Проверка типов в dev режиме
        ] as PluginOption[],
        build: {
            outDir: "dist",      // Директория для сборки продакшен бандла
            target: browserslistToEsbuild([">0.5%", "not dead", "last 2 versions", "not op_mini all", "not ie <= 11"]),   // Установка browerlists
            rollupOptions: {
                external: [
                    // Не включаем в итоговую сборку файлы тестов (чтобы не повышать время сборки)
                    /\.test\.ts?$/,
                    /\.test\.tsx?$/,
                ],
                output: {
                    manualChunks: {
                        // Вынесем React и ReactDOM
                        react: ["react", "react-dom", "react-dom/client"],
                        // Вынесем MUI и Emotion
                        mui: ["@mui/material", "@emotion/react", "@emotion/styled", "@mui/icons-material", "@mui/lab"],
                        // Вынесем Zustand
                        zustand: ["zustand"],
                        // Вынесем WebSocket клиент
                        socket: ["socket.io-client"],
                        // Вынесем i18next
                        i18n: ["i18next", "react-i18next"],
                        // Вынесем React Router
                        router: ["react-router-dom"],
                        // Вынесем Axios
                        axios: ["axios"],
                        // Вынесем Zod
                        zod: ["zod"]
                    }   // Разбиваем большой чанк на более мелкие по размерности (с помощью плагина visualizer)
                }
            },                  // Опции для разбиения основного чанка на более мелкие чанки
            commonjsOptions: {
                include: [
                    /common-types/,
                    /node_modules/
                ]
            }
        },
        publicDir: "public",    // Директория для статичных файлов (дает возможность обращаться к картинках/шрифтам и тд прямиком из папки public)
        server: {
            open: true,         // Автоматически открывает браузер при запуске проекта
            port: 3000,         // Порт локального сервера для разработки клиента
            https: mode === "development" ? {
                key: fs.readFileSync("../server/certs/localhost-key.pem"),
                cert: fs.readFileSync("../server/certs/localhost.pem"),
            } : undefined,
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
                "@custom-types": path.resolve(__dirname, "src/types"),     // Короткий путь для папки types
                "@styles": path.resolve(__dirname, "src/styles"),          // Короткий путь для папки styles
                "@utils": path.resolve(__dirname, "src/utils")             // Короткий путь для папки utils
            }                   // Добавление коротких путей
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        @use "@styles/abstract/colors.scss" as *;
                        @use "@styles/abstract/variables.scss" as *;
                    `
                }
            }
        },
        // Отдаем на перекодирование commonjs модуль в ESM модуль
        optimizeDeps: {
            include: ["common-types"]
        },
    }
});