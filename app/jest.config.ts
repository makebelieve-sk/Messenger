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
  },

  transform: {
    "^.+\\.tsx?$": "ts-jest", // Обрабатываем TypeScript файлы через ts-jest
    "^.+\\.scss$": "jest-scss-transform",
  },

  // Настройки для покрытия (coverage) кода
  collectCoverage: true,
  collectCoverageFrom: ["src/components/*.{ts,tsx}", "!src/**/*.d.ts"], // собираем покрытие только для исходных файлов

  // Игнорируем папки и файлы, которые не должны попадать в coverage
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
};

export default config;
