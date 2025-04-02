import type { Config } from "jest";

const config: Config = {
  // Пресет для работы с TypeScript через ts-jest
  preset: "ts-jest",

  // Среда для тестов, для работы с DOM компонентами
  testEnvironment: "jsdom",

  // Массив файлов, которые будут выполнены перед тестами
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],

  // Для настройки путей или алиасов, если они используются
  moduleNameMapper: {
    "^@components/(.*)$": "<rootDir>/src/components/$1",
  },

  // Обработчик для стилей, чтобы Jest их игнорировал
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Обрабатываем TypeScript файлы через ts-jest
    "^.+\\.css$": "jest-css-modules",
  },

  // Настройки для покрытия (coverage) кода
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"], // собираем покрытие только для исходных файлов

  // Игнорируем папки и файлы, которые не должны попадать в coverage
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
};

export default config;
