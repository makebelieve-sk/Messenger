// Общий конфиг линтера, эти правила наследуют конфигурации линтера в папках "app" и "services"
export default {
    files: ["**/*.{ts,tsx}"],                                       // Проверяем только нужные файлы
    ignores: ["**/dist/**", "**/node_modules/**"],
    languageOptions: {
        ecmaVersion: "latest",                                      // Уровень ECMAScript
        sourceType: "module",                                       // Используем модули
    },
    rules: {
        "comma-spacing": [
            "warn",
            { "before": false, "after": true },
        ],                                                          // Пробел после запятой
        "object-curly-spacing": [
            "warn",
            "always",
            { "objectsInObjects": true, "arraysInObjects": true },
        ],                                                          // Пробелы внутри { }
        "array-bracket-spacing": [ "warn", "always" ],              // [ 1, 2 ] вместо [1, 2]
        "computed-property-spacing": [
            "warn", "never",
        ],                                                          // obj[prop] вместо obj[ prop ]
        "key-spacing": [ "warn", {
            "beforeColon": false,
            "afterColon": true,
        } ],                                                        // Пробел перед двоеточием
        "no-console": "warn",                                       // Предупреждать об использовании "console.log"
        "quotes": [ "warn", "double" ],                             // Использовать двойные кавычки
        "semi": [ "warn", "always" ],                               // Требовать точку с запятой
        "comma-dangle": [ "warn", "always-multiline" ],             // Требовать запятые в многострочных объектах
        "indent": [ "warn", "tab" ],                                // Использовать отступы в 1 таб
        "no-tabs": "off",                                           // Отключаем запрет на табы (если был включен)
        "max-len": [ "warn", { "code": 160 } ],                     // Максимальная длина строки - 160 символов
        "arrow-parens": "off",                                      // Отключить оборачивание в скобки одного параметра в функции
    },
};