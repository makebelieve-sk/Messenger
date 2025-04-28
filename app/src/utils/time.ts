import Logger from "@service/Logger";

const logger = Logger.init("utils/time");

// Получение текущей даты
export const currentDate = new Date().toUTCString();

// Получение часов или минут в формате 00:00
export const getHoursOrMinutes = (time: number) => {
	logger.debug(`getHoursOrMinutes [time=${time}]`);
	return time < 10 ? `0${time}` : time;
};

// Получение часов и минут
export const getHoursWithMinutes = (createDate: string) => {
	logger.debug(`getHoursWithMinutes [createDate=${createDate}]`);
	return `${getHoursOrMinutes(new Date(createDate).getHours())}:${getHoursOrMinutes(new Date(createDate).getMinutes())}`;
};
