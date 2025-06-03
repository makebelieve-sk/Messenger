"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const index_1 = require("@errors/index");
const constants_1 = require("@utils/constants");
const datetime_1 = require("@utils/datetime");
const logger = (0, logger_1.default)("Process");
const signals = ["SIGINT", "SIGTERM", "SIGUSR2"];
const REPORTS_PATH = path_1.default.join(__dirname, "../", constants_1.REPORTS_DIR);
/**
 * Класс, предоставляет обертку над обработкой всех возможных ошибок (как синхронных, так и асинхронных).
 * При этом, генерирует отчет о необработанных ошибках.
 */
class ProcessWorks {
    constructor() {
        if (!constants_1.IS_DEV)
            this._configureReport();
        this._init();
    }
    // Добавление новой задачи/джобы для остановки в процессе остановки сервера
    static registerCleanupTask(cb) {
        ProcessWorks.cleanupTasks.push(cb);
    }
    // Установка сервера
    setServer(mainServer) {
        this._mainServer = mainServer;
        this._registerShutdownSignals();
    }
    // Остановка сервера с ошибкой
    async stopServerWithError() {
        await this._shutdown(1);
    }
    // Конфигурация Diagnostic Report - детальная информация об ошибке
    _configureReport() {
        logger.debug("_configureReport");
        // Создаём директорию для отчётов, если её нет
        if (!fs_1.default.existsSync(REPORTS_PATH)) {
            fs_1.default.mkdirSync(REPORTS_PATH);
        }
        process.report.directory = REPORTS_PATH; // Путь к папке, в которой будут генерироваться отчеты
        process.report.reportOnSignal = true; // Будет ли генерироваться отчет, если процесс Node.js завершиться из-за сигнала
        process.report.reportOnFatalError = true; // Будет ли генерироваться отчет в случае фатальной ошибки в процессе Node.js
        process.report.reportOnUncaughtException = true; // Будет ли генерироваться отчёт в случае необработанной исключительной ситуации
    }
    _init() {
        logger.debug("_init");
        // Обрабатываем пробрасываемые исключения синхронного кода
        process.on("uncaughtException", async (error) => {
            await this._handleError((0, i18n_1.t)("error.unhandled_sync", { errorMessage: error.toString() }), "exception");
        });
        // Обрабатываем пробрасываемые исключения асинхронного кода
        process.on("unhandledRejection", async (reason, promise) => {
            await this._handleError((0, i18n_1.t)("error.unhandled_async", { reason, promise: promise.toString() }), "rejection");
        });
    }
    // Обработка возникшей ошибки
    async _handleError(error, reportReason) {
        new index_1.BaseError(error);
        // Генерируем отчет об необработанной ошибке
        if (!constants_1.IS_DEV)
            this._generateReport(reportReason);
        await this._shutdown(1);
    }
    // Генерация отчета с ошибкой, с учетом timestamp
    _generateReport(reason) {
        logger.debug("_generateReport");
        const reportFilePath = `report-${reason}-${datetime_1.timestamp}.json`;
        process.report.writeReport(reportFilePath);
    }
    // Обработка остановки сервера
    async _shutdown(exitCode) {
        try {
            // Выполняем дополнительные задачи (джобы)
            if (ProcessWorks.cleanupTasks.length) {
                for (const task of ProcessWorks.cleanupTasks) {
                    await task();
                }
            }
            // Обнуляем список задач после их успешного выполнения
            ProcessWorks.cleanupTasks.length = 0;
            // Закрываем соединение с бд, сокетом и редисом
            await this._mainServer.close();
            logger.info((0, i18n_1.t)("process.close_server", { code: exitCode.toString() }));
        }
        catch (error) {
            logger.error((0, i18n_1.t)("process.error.close_server", { error: error.message }));
            new index_1.BaseError(error.message);
        }
        finally {
            // Завершаем выполнение процесса NodeJS
            process.exit(exitCode);
        }
    }
    // Ручное управление остановкой сервера
    _registerShutdownSignals() {
        const handleSignal = (signal) => async () => {
            logger.info((0, i18n_1.t)("process.get_signal_before_close", { signal }));
            if (signal === signals[2]) {
                // Для nodemon: пересылаем назад после очистки
                await this._shutdown(0);
                process.kill(process.pid, signals[2]);
            }
            else {
                await this._shutdown(0);
            }
        };
        // Регистрируем лишь один обработчик для каждого сигнала
        signals.forEach(sig => {
            process.once(sig, handleSignal(sig));
        });
    }
}
ProcessWorks.cleanupTasks = [];
exports.default = ProcessWorks;
//# sourceMappingURL=Process.js.map