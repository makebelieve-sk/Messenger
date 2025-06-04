import type { Config } from "jest";

const config: Config = {
    // Пресет для работы с TypeScript через ts-jest
    preset: "ts-jest",

    // Среда для тестов, для работы с DOM компонентами
    testEnvironment: "jest-environment-jsdom",

    // Массив файлов, которые будут выполнены перед тестами
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

    // Для настройки путей или алиасов, если они используются
    moduleNameMapper: {
        "^@components/(.*)$": "<rootDir>/src/components/$1",
        "^@core/(.*)$": "<rootDir>/src/core/$1",
        "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
        "^@locales/(.*)$": "<rootDir>/src/locales/$1",
        "^@modules/(.*)$": "<rootDir>/src/modules/$1",
        "^@pages/(.*)$": "<rootDir>/src/pages/$1",
        "^@service/(.*)$": "<rootDir>/src/service/$1",
        "^@store/(.*)$": "<rootDir>/src/store/$1",
        "^@custom-types/(.*)$": "<rootDir>/src/types/$1",
        "^@styles/(.*)$": "<rootDir>/src/styles/$1",
        "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    },

    // Трансформаторы для обработки файлов
    transform: {
        "^.+\\.(ts|tsx)$": ["ts-jest", {
            useESM: true,
        }],
        "^.+\\.scss$": "jest-scss-transform",
    },

    // Настройки для покрытия (coverage) кода
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"], // собираем покрытие только для исходных файлов

    // Игнорируем папки и файлы, которые не должны попадать в coverage
    coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/src/index.tsx", "/*.stories.tsx", "/utils/constants.ts", "/types/*.ts"],

    // Добавляем игнорирование файлов
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],

    // Игнорируем предупреждения Node.js
    globals: {
        NODE_OPTIONS: "--no-warnings"
    }
};

export default config;