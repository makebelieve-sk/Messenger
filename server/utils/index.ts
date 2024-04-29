import { IUser } from "../types/models.types";
import { UserPartial } from "../types/user.types";

// Получить полное имя пользователя (Имя + Фамилия)
export const getFullName = (user: IUser | UserPartial) => {
    return user.firstName + " " + user.thirdName;
};