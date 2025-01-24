import { ISafeUser, UserPartial } from "../types/user.types";

// Получить полное имя пользователя (Имя + Фамилия)
export const getFullName = (user: ISafeUser | UserPartial) => {
    return user.firstName + " " + user.thirdName;
};