"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = void 0;
exports.initI18n = initI18n;
const i18next_1 = __importDefault(require("i18next"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const i18n_config_1 = __importDefault(require("@config/i18n.config"));
const logger_1 = __importDefault(require("@service/logger"));
const index_1 = require("@errors/index");
const logger = (0, logger_1.default)("i18");
function initI18n(cb) {
    logger.debug("initI18n");
    // Настройка интернациональности
    i18next_1.default
        // Middleware для автоматического определения языка пользователя из заголовков запроса (Accept-Language и тп)
        .use(i18next_http_middleware_1.default.LanguageDetector)
        .init(i18n_config_1.default, (error) => {
        if (error) {
            new index_1.BaseError(`${t("error.initialize_i18n")}: ${error.message}`);
            process.exit(1);
        }
        cb();
    });
}
const t = (key, options = {}) => i18next_1.default.t(key, options);
exports.t = t;
//# sourceMappingURL=i18n.js.map