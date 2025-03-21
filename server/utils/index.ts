import Logger from "@service/logger";
import { ISafeUser, UserPartial } from "@custom-types/user.types";

const logger = Logger("utils");

// Получить полное имя пользователя (Имя + Фамилия)
export const getFullName = (user: ISafeUser | UserPartial) => {
    logger.debug("getFullName [user=%j]", user);
    return user.firstName + " " + user.thirdName;
};

export const SOCKET_MIDDLEWARE_ERROR = "SOCKET_MIDDLEWARE_ERROR";