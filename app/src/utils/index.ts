import Logger from "@service/Logger";
import { Pages } from "@custom-types/enums";
import { type IUser } from "@custom-types/models.types";

const logger = Logger.init("utils");

// Склонение переданного массива строк по переданому числу
export const muchSelected = (number: number, txt: string[]) => {
	const cases = [ 2, 0, 1, 1, 1, 2 ];

	return txt[(number % 100 > 4 && number % 100 < 20)
		? 2
		: cases[(number % 10 < 5) ? number % 10 : 5]];
};

// Получить полное имя пользователя (Имя + Фамилия)
export const getFullName = (user: IUser) => {
	logger.debug(`getFullName [firstName=${user.firstName}, thirdName=${user.thirdName}]`);
	return user ? user.firstName + " " + user.thirdName : "";
};

// Установка фокуса HTML элементу в самый конец
export const setFocusOnEndNodeElement = (node: HTMLElement, pos = node.childNodes.length) => {
	logger.debug(`setFocusOnEndNodeElement [pos=${pos}]`);

	const range = document.createRange();
	const selection = window.getSelection() as Selection;
	range.setStart(node, pos);
	range.collapse(true);
	selection.removeAllRanges();
	selection.addRange(range);
};

// Переход на страницу другого пользователя
export const goToAnotherProfile = (url: Pages, userId?: string) => {
	// encodeURIComponent необходим, чтобы в URL не было спецсимволов (мало ли в userId что-то подобное есть)
	return userId ? `${url}/${encodeURIComponent(userId)}` : url;
};