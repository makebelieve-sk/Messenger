// 1 минута
export const oneMinute = 60 * 1000;

// 1 день
export const oneHour = 60 * oneMinute;

// 1 день
export const oneDay = 24 * oneHour;

// 1 месяц
export const oneMonth = 30 * oneDay;

// 6 месяцев
export const sixMonths = oneMonth * 6;

// Получение текущей даты
export const currentDate = new Date().toUTCString();

// Генерируем имя файла с timestamp
export const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // Пример: 2023-10-10T12-34-56-789Z
