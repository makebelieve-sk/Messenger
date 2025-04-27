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
    "^.+\\.tsx?$": "ts-jest", // Обрабатываем TypeScript файлы через ts-jest
    "^.+\\.scss$": "jest-scss-transform", // Преобразуем SCSS файлы через jest-scss-transform для корректной обработки стилей
  },

  // Настройки для покрытия (coverage) кода
  collectCoverage: true,
  collectCoverageFrom: ["src/components/**/*.{ts,tsx}", "!src/**/*.d.ts"], // собираем покрытие только для исходных файлов

  // Игнорируем папки и файлы, которые не должны попадать в coverage
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],

  // Добавляем игнорирование файлов, связанных с Vitest
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/", "\\.vitest\\.",]
};

export default config;
