import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from '@jest/types';

import { compilerOptions } from './tsconfig.json';

const config: Config.InitialOptions = {
    // Используем ts-jest для трансформации TS
    preset: 'ts-jest',
    testEnvironment: 'node',

    // Поддерживаем импорты .ts, .js и .json
    moduleFileExtensions: ['ts', 'js', 'json'],

    // Корень проекта
    rootDir: '.',

    // Все тесты с расширением .spec.ts
    testMatch: ['<rootDir>/src/**/*.spec.ts'],

    // Трансформация файлов через ts-jest с конфигом прямо тут
    transform: {
        '^.+\\.(t|j)s$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json',
                diagnostics: false,
            }
        ],
    },

    // Маппинг алиасов из tsconfig (baseUrl + paths)
    moduleNameMapper: pathsToModuleNameMapper(
        compilerOptions.paths || {},
        { prefix: '<rootDir>/' }
    ),

    // Игнорировать модули
    transformIgnorePatterns: ['<rootDir>/node_modules/'],

    // Сбор покрытия
    collectCoverageFrom: [
        'src/**/*.{ts,js}',
        '!src/main.ts',
        '!src/migrations/**',
        '!**/node_modules/**',
        '!src/modules/strategies/**',
        '!**/dist/**'
    ],
    coverageDirectory: 'coverage',

    // Таймаут для долгих тестов
    testTimeout: 30000,
};

export default config;
