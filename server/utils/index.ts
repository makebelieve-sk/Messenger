import { ISafeUser, UserPartial } from "../types/user.types";

// Получить полное имя пользователя (Имя + Фамилия)
export const getFullName = (user: ISafeUser | UserPartial) => {
    return user.firstName + " " + user.thirdName;
};

// Валидация номера телефона в качестве логина
export function validPhoneNumber(phone: string) {
    const phoneNumer = phone.replace(/[^0-9]/g, "");

    if (phoneNumer.length !== 11) {
        return false;
    }

    return phoneNumer[0] === "8" ? "+7" + phoneNumer.slice(1) : "+" + phoneNumer;
}