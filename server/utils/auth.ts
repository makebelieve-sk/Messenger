import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

import Logger from "@service/logger";

const logger = Logger("utils/auth");

// Перевод российского номера в международный формат
function normalizeRussianNumber(phoneNumber: string) {
	logger.debug("normalizeRussianNumber [phoneNumber=%s]", phoneNumber);

	/**
	 * Если номер телефона начинается с 8 или 7, но не с +7 - предпологаем, что это российский формат
	 * Необходимо его привести в международний вид, добавив +
	 */
	if (phoneNumber.startsWith("8") || phoneNumber.startsWith("7")) {
		return `+7${phoneNumber.slice(1)}`;
	}

	// Остальные форматы оставляем как есть
	return phoneNumber;
}

// Валидация номера телефона в качестве логина
export function validatePhoneNumber(phone: string) {
	logger.debug("validatePhoneNumber [phone=%s]", phone);

	// Перевод российского номера в международный формат
	const normalizePhoneNumber = normalizeRussianNumber(phone);

	// Обшая валидация номера телефона (проверка по длине и цифрам)
	if (isValidPhoneNumber(normalizePhoneNumber)) {
		// Валидация номера телефона
		const parsedNumber = parsePhoneNumberFromString(normalizePhoneNumber);

		return parsedNumber ? parsedNumber.number : false;
	}

	return false;
}

// Валидация электронной почты в качестве логина
export function validateEmail(email: string) {
	logger.debug("validateEmail [email=%s]", email);

	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	return emailRegex.test(email) ? email : false;
}
