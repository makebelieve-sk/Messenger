"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestamp = exports.currentDate = exports.sixMonths = exports.oneMonth = exports.oneDay = exports.oneHour = exports.oneMinute = void 0;
// 1 минута
exports.oneMinute = 60 * 1000;
// 1 день
exports.oneHour = 60 * exports.oneMinute;
// 1 день
exports.oneDay = 24 * exports.oneHour;
// 1 месяц
exports.oneMonth = 30 * exports.oneDay;
// 6 месяцев
exports.sixMonths = exports.oneMonth * 6;
// Получение текущей даты
exports.currentDate = new Date().toUTCString();
// Генерируем имя файла с timestamp
exports.timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // Пример: 2023-10-10T12-34-56-789Z
//# sourceMappingURL=datetime.js.map