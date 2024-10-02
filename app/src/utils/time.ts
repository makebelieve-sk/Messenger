import { Times } from "../types/enums";

interface IGetTimeOptions {
    withoutYesterday?: boolean;
};

// Получение часов или минут в формате 00:00
export const getHoursOrMinutes = (time: number) => {
    return time < 10 ? `0${time}` : time;
};

// Получение названия месяца
export const getMonthName = (month: number) => {
    const months = ["янв", "фев", "мар", "апр", "мая", "июня", "июля", "авг", "сент", "окт", "нояб", "дек"];

    return " " + months[month];
};

// Получение даты
export const getDate = (date: string) => date && date.length ? new Date(date).getDate() : null;

// Выводим конечную дату
export const transformDate = (d: string, getYear = false) => {
    const date = new Date(d);
    const months = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря",
    ];

    const dayNumber = date.getDate();
    const month = months[date.getMonth()];
    const year = getYear
        ? " " + date.getFullYear()
        : new Date().getMonth() - date.getMonth() >= 6
            ? " " + date.getFullYear()
            : "";

    return dayNumber + " " + month + year;
};

// Получение часов и минут
export const getHoursWithMinutes = (createDate: string) => {
    return `${getHoursOrMinutes(new Date(createDate).getHours())}:${getHoursOrMinutes(new Date(createDate).getMinutes())}`;
};

// Получение даты сообщения в списке диалогов
export const getTime = (createDate: string, options: IGetTimeOptions = {}) => {
    const { withoutYesterday } = options;
    const date = Date.parse(createDate);
    const beforeMidnight = new Date().getDate() - new Date(createDate).getDate() > 0;

    return Date.now() - date > Times.HALF_YEAR
        ? new Date(createDate).getDate() + getMonthName(new Date(createDate).getMonth()) + " " + new Date(createDate).getFullYear()
        : Date.now() - date > Times.YESTERDAY && Date.now() - date < Times.HALF_YEAR
            ? new Date(createDate).getDate() + getMonthName(new Date(createDate).getMonth())
            : Date.now() - date > Times.TODAY && Date.now() - date < Times.YESTERDAY
                ? `${withoutYesterday ? "" : "вчера "}` + getHoursOrMinutes(new Date(createDate).getHours()) + ":" + getHoursOrMinutes(new Date(createDate).getMinutes())
                : Date.now() - date < Times.TODAY
                    ? `${beforeMidnight ? "вчера " : ""}` + getHoursOrMinutes(new Date(createDate).getHours()) + ":" + getHoursOrMinutes(new Date(createDate).getMinutes())
                    : null;
};

// Трансформация даты дня рождения
export const transformBirthday = (date: string) => {
    const dates = date.split("-");

    return dates[2] + getMonthName(+dates[1] - 1) + ". " + dates[0];
};