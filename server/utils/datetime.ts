// 1 день
export const oneDay = 24 * 60 * 60 * 1000;

// 1 месяц
export const oneMonth = 30 * oneDay;

// 6 месяцев
export const sixMonths = oneMonth * 6;

// Разница между часовыми поясами (в часах)
export const timezoneOffset = Math.abs(new Date().getTimezoneOffset() / 60);