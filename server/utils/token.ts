import { oneMonth, timezoneOffset } from "./datetime";

// Время истечения срока токена
export const getExpiredToken = (rememberMe: boolean) => {
    // Если для этого пользователя был установлен флаг "Запомнить меня" - обновляем время жизни токена на 30 дней
    // Иначе обновляем до первого выхода
    return rememberMe
        ? new Date(Date.now() + timezoneOffset + oneMonth)
        : undefined;
};