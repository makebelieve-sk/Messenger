import { type Dayjs } from "dayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import i18next from "@service/i18n";
import Logger from "@service/Logger";
import { Times } from "@custom-types/enums";
import { getHoursOrMinutes } from "@utils/time";

const logger = Logger.init("utils/date");

// Список месяцев с короткими именами
const shortNamesMonths = [
	i18next.t("utils.months.jan"),
	i18next.t("utils.months.feb"),
	i18next.t("utils.months.mar"),
	i18next.t("utils.months.apr"),
	i18next.t("utils.months.may"),
	i18next.t("utils.months.june"),
	i18next.t("utils.months.july"),
	i18next.t("utils.months.aug"),
	i18next.t("utils.months.sep"),
	i18next.t("utils.months.oct"),
	i18next.t("utils.months.nov"),
	i18next.t("utils.months.dec"),
];

// Список месяцев с полными именами
const fullNameMonths = [
	i18next.t("utils.months.january"),
	i18next.t("utils.months.february"),
	i18next.t("utils.months.march"),
	i18next.t("utils.months.april"),
	i18next.t("utils.months.may"),
	i18next.t("utils.months.june"),
	i18next.t("utils.months.july"),
	i18next.t("utils.months.august"),
	i18next.t("utils.months.september"),
	i18next.t("utils.months.october"),
	i18next.t("utils.months.november"),
	i18next.t("utils.months.december"),
];

// Получение названия месяца
export const getMonthName = (month: number) => {
	logger.debug(`getMonthName [month=${month}]`);
	return " " + shortNamesMonths[month];
};

// Получение даты
export const getDate = (date: string) => {
	logger.debug(`getDate [date=${date}]`);
	return date && date.length ? new Date(date).getDate() : null;
};

// Выводим конечную дату
export const transformDate = (d: string, getYear = false) => {
	logger.debug(`transformDate [d=${d}, getYear=${getYear}]`);

	const date = new Date(d);

	const dayNumber = date.getDate();
	const month = fullNameMonths[date.getMonth()];
	const year = getYear ? " " + date.getFullYear() : new Date().getMonth() - date.getMonth() >= 6 ? " " + date.getFullYear() : "";

	return dayNumber + " " + month + year;
};

// Получение даты сообщения в списке диалогов
dayjs.extend(utc);

export const getTime = (createDate: string, options: { withoutYesterday?: boolean } = {}) => {
  const { withoutYesterday } = options;

  const date = dayjs.utc(createDate);
  const now = dayjs.utc();

  const diff = now.diff(date);

  if (diff > Times.HALF_YEAR) {
    return `${date.date()}${getMonthName(date.month())} ${date.year()}`;
  }

  if (diff > Times.YESTERDAY && diff <= Times.HALF_YEAR) {
    return `${date.date()}${getMonthName(date.month())}`;
  }

  if (diff > Times.TODAY && diff <= Times.YESTERDAY) {
    return `${withoutYesterday ? "" : i18next.t("utils.yesterday")}${date.format("HH:mm")}`;
  }

  if (diff <= Times.TODAY) {
    const isYesterday = now.startOf("day").diff(date.startOf("day")) === 1;
    return `${isYesterday && !withoutYesterday ? i18next.t("utils.yesterday") : ""}${date.format("HH:mm")}`;
  }

  return null;
};

// Форматирование даты
export const formattedValue = (date: Dayjs | null): string | null => {
	return date ? date.format("YYYY-MM-DD") : null;
};
