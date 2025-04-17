import { type Dayjs } from "dayjs";

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
export const getTime = (createDate: string, options: { withoutYesterday?: boolean } = {}) => {
	logger.debug(`getTime [createDate=${createDate}, withoutYesterday=${options.withoutYesterday}]`);

	const { withoutYesterday } = options;
	const date = Date.parse(createDate);
	const beforeMidnight = new Date().getDate() - new Date(createDate).getDate() > 0;

	return Date.now() - date > Times.HALF_YEAR
		? new Date(createDate).getDate() + getMonthName(new Date(createDate).getMonth()) + " " + new Date(createDate).getFullYear()
		: Date.now() - date > Times.YESTERDAY && Date.now() - date < Times.HALF_YEAR
			? new Date(createDate).getDate() + getMonthName(new Date(createDate).getMonth())
			: Date.now() - date > Times.TODAY && Date.now() - date < Times.YESTERDAY
				? `${withoutYesterday ? "" : i18next.t("utils.yesterday")}` +
					getHoursOrMinutes(new Date(createDate).getHours()) +
					":" +
					getHoursOrMinutes(new Date(createDate).getMinutes())
				: Date.now() - date < Times.TODAY
					? `${beforeMidnight ? i18next.t("utils.yesterday") : ""}` +
						getHoursOrMinutes(new Date(createDate).getHours()) +
						":" +
						getHoursOrMinutes(new Date(createDate).getMinutes())
					: null;
};

// Форматирование даты
export const formattedValue = (date: Dayjs | null): string | null => {
	return date ? date.format("YYYY-MM-DD") : null;
};
