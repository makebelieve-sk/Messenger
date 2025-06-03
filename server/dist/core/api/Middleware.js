"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const multer_1 = require("multer");
const path_1 = __importDefault(require("path"));
const rate_limiter_config_1 = require("@config/rate-limiter.config");
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const index_1 = require("@errors/index");
const enums_1 = require("@custom-types/enums");
const constants_1 = require("@utils/constants");
const files_1 = require("@utils/files");
const session_1 = require("@utils/session");
const logger = (0, logger_1.default)("Middleware");
const LIMIT_FILE_SIZE = "LIMIT_FILE_SIZE";
const LIMIT_FILE_COUNT = "LIMIT_FILE_COUNT";
// Класс, отвечает за выполнение мидлваров для HTTP-запросов
class Middleware {
    constructor(_redisWork, _app) {
        this._redisWork = _redisWork;
        this._app = _app;
    }
    // Общий мидлвар. Ограничение на число запросов на ендпоинт по id сессии или его ip-адресу
    rateLimiter() {
        logger.debug("rateLimiter");
        this._app.use((req, res, next) => {
            req.isAuthenticated()
                ? (0, rate_limiter_config_1.sessionIdLimiter)(req, res, next)
                : (0, rate_limiter_config_1.ipLimiter)(req, res, next);
        });
    }
    // Частный мидлвар. Пользователь должен быть авторизован в системе
    async mustAuthenticated(req, _, next) {
        try {
            const user = req.user;
            logger.debug("mustAuthenticated [user=%j]", user);
            if (!req.isAuthenticated()) {
                throw new index_1.MiddlewareError((0, i18n_1.t)("auth.error.not_auth_or_token_expired"), common_types_1.HTTPStatuses.Unauthorized);
            }
            if (!user) {
                throw new index_1.MiddlewareError((0, i18n_1.t)("users.error.user_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            // Получаем поле rememberMe из Redis
            const rememberMe = await this._redisWork.get(enums_1.RedisKeys.REMEMBER_ME, user.id);
            // Обновление времени жизни куки сессии и времени жизни этой же сессии в RedisStore
            await (0, session_1.updateSessionMaxAge)(req.session, Boolean(rememberMe));
            // Обновляем время жизни записи только в том случае, если пользователь не нажал на "Запомнить меня"
            if (!rememberMe) {
                await this._redisWork.expire(enums_1.RedisKeys.REMEMBER_ME, user.id);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    }
    // Общий мидлвар. Общая обработка ошибок, вызванных в контроллерах через next(error)
    catch() {
        logger.debug("catch");
        // Для корректного выполнения обработчика ошибки ендпоинтов необходимо всегда указывать 4 параметра (даже если все 4 не используются)
        this._app.use((error, _, res, __) => {
            const nextError = error instanceof index_1.BaseError
                ? error
                : this._createNewError(error.message, error instanceof multer_1.MulterError ? error.code : undefined);
            const errorMessage = {
                success: false,
                message: nextError.message,
                options: nextError.getOptions(),
            };
            /**
             * Поле message в объекте логгера Winston зарезервировано, поэтому невозможно вывести текстовое сообщение,
             * приходится изменять выводимый объект.
             */
            logger.error("catch error middleware [errorMessage=%j]", {
                status: errorMessage.success,
                errorText: errorMessage.message,
                options: errorMessage.options,
            });
            res.status(nextError.status).send(errorMessage);
        });
    }
    // Частный мидлвар. Сжимаем изображение аватара
    async sharpAvatar(req, _, next) {
        logger.debug("sharpAvatar [req.file=%j]", req.file);
        try {
            // Сжимаем переданный аватар пользователя и дублируем его на диск в раздел "Фотографии"
            const { folderPath, outputFile } = await (0, files_1.createSharpedImage)({
                ...req.file,
                fieldname: "photo",
            });
            req.sharpedPhotoUrl = path_1.default.join(folderPath, outputFile);
            // Сжимаем переданный аватар пользователя
            req.sharpedAvatarUrl = await this._getSharpedUrl(req);
            next();
        }
        catch (error) {
            next(error);
        }
    }
    // Частный мидлвар. Сжимаем несколько фотографий
    async sharpImages(req, _, next) {
        try {
            const files = req.files;
            logger.debug("sharpImages [files=%j]", files);
            if (!files || !files.length) {
                throw new index_1.MiddlewareError((0, i18n_1.t)("photos.error.photo_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            Promise.all(files.map(async (file) => {
                req.file = file;
                return await this._getSharpedUrl(req);
            }))
                .then(result => {
                // Сохраняем массив обрезанных изображений
                req.sharpedImageUrls = result;
                // Удаляем оригинальные объекты файлов из запроса
                delete req.files;
                next();
            })
                .catch((error) => {
                // Пишем return next потому, что try catch обрабатывает ошибки только в синхронном коде, а значит при throw он их не перехватит
                return next(new index_1.MiddlewareError((0, i18n_1.t)("photos.error.sharped_photo_with_error", {
                    errorMessage: error.message,
                })));
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Обработка типа ошибки и её создание, если это обычная ошибка сервера, иначе возврат ошибки Multer с соответствующим сообщением
    _createNewError(message, code) {
        switch (code) {
            // Это проверки ошибки Multer - их всего два типа: на максимальный размер и количество файлов
            case LIMIT_FILE_SIZE:
                return new index_1.BaseError((0, i18n_1.t)("middleware.error.limit_file_size", {
                    maxSize: (constants_1.MB_1 * constants_1.MULTER_MAX_FILE_SIZE).toString(),
                }), common_types_1.HTTPStatuses.PayloadTooLarge);
            case LIMIT_FILE_COUNT:
                return new index_1.BaseError((0, i18n_1.t)("middleware.error.limit_file_count", {
                    maxCount: constants_1.MULTER_MAX_FILES_COUNT.toString(),
                }), common_types_1.HTTPStatuses.PayloadTooLarge);
            // Иначе это обычная ошибка, которая возникла на сервере (не кастомная) и её нужно вернуть со статусом 500 (по умолчанию)
            default:
                return new index_1.BaseError(message);
        }
    }
    // Получение пути к сжатому изображению
    async _getSharpedUrl(req) {
        try {
            const file = req.file;
            logger.debug("_getSharpedUrl [file=%j]", file);
            if (!file) {
                throw new index_1.MiddlewareError((0, i18n_1.t)("photos.error.photo_not_given"), common_types_1.HTTPStatuses.BadRequest);
            }
            const { folderPath, outputFile } = await (0, files_1.createSharpedImage)(file);
            // Удаляем оригинальный объект файла из запроса
            delete req.file;
            return path_1.default.join(folderPath, outputFile);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = Middleware;
//# sourceMappingURL=Middleware.js.map