"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePhoneNumber = validatePhoneNumber;
exports.validateEmail = validateEmail;
const libphonenumber_js_1 = require("libphonenumber-js");
const logger_1 = __importDefault(require("@service/logger"));
const logger = (0, logger_1.default)("utils/auth");
// Убираем лишние символы: пробелы, скобки, дефисы и т.п.
function stripFormatting(phone) {
    return phone.trim().replace(/[()\s-]+/g, "");
}
// Приводим «8xxxxxxx» или «+8xxxxxxx» к «+7xxxxxxx»
function normalizeLeadingEight(cleaned) {
    if (cleaned.startsWith("+8")) {
        // +8xxx → +7xxx
        return "+7" + cleaned.slice(2);
    }
    if (/^[87]\d+$/.test(cleaned)) {
        // 8xxx или 7xxx → +7xxx
        return "+7" + cleaned.slice(1);
    }
    return cleaned;
}
/**
 * Валидирует и нормализует телефон (E.164).
 * Возвращает строку вида "+71234567890" или `false` при невалиде.
 */
function validatePhoneNumber(phone) {
    logger.debug("validatePhoneNumber [phone=%s]", phone);
    // 1) Стрипим форматирование
    let cleaned = stripFormatting(phone); // "(8) 912-345-67-89" → "89123456789"
    // 2) Приводим ведущую «8»/«+8» к «+7»
    cleaned = normalizeLeadingEight(cleaned);
    // 3) Парсим с дефолтной страной RU, чтобы короткие номера воспринимались как российские, например "9123456789"
    const parsed = (0, libphonenumber_js_1.parsePhoneNumberFromString)(cleaned, "RU");
    // 4) Проверяем валидность
    if (parsed && parsed.isValid()) {
        // возвращаем E.164, например "+79123456789" или "+442071838750"
        return parsed.number;
    }
    return false;
}
// Валидация электронной почты в качестве логина
function validateEmail(email) {
    logger.debug("validateEmail [email=%s]", email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? email : false;
}
//# sourceMappingURL=auth.js.map