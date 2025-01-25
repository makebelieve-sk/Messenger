// Получение текущей даты
export const currentDate = new Date().toUTCString();

// Получение часов или минут в формате 00:00
export const getHoursOrMinutes = (time: number) => {
    return time < 10 ? `0${time}` : time;
};

// Получение часов и минут
export const getHoursWithMinutes = (createDate: string) => {
    return `${getHoursOrMinutes(new Date(createDate).getHours())}:${getHoursOrMinutes(new Date(createDate).getMinutes())}`;
};