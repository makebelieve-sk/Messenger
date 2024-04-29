import { IUser } from "../types/models.types";
// import { UserPartial } from "../pages/messages";

// Склонение переданного массива строк по переданому числу
export const muchSelected = (number: number, txt: string[]) => {
    const cases = [2, 0, 1, 1, 1, 2];

    return txt[(number % 100 > 4 && number % 100 < 20)
        ? 2
        : cases[(number % 10 < 5) ? number % 10 : 5]];
};

// Получить полное имя пользователя (Имя + Фамилия)
export const getFullName = (user: IUser | any) => {
    return user.firstName + " " + user.thirdName;
};

// Установка фокуса HTML элементу в самый конец
export const setFocusOnEndNodeElement = (node: HTMLElement, pos = node.childNodes.length) => {
    const range = document.createRange();
    const selection = window.getSelection() as Selection;
    range.setStart(node, pos);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
};