import fs from "fs";
import path from "path";

import { BaseError } from "../errors";
import { t } from "./i18n";

const REPORTS_DIR = process.env.REPORTS_PATH as string;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const REPORTS_PATH = path.join(__dirname, "../", REPORTS_DIR);

// Класс, предоставляет обертку над обработкой всех возможных ошибок (как синхронных, так и асинхронных). При этом, генерирует отчет о необработанных ошибках.
export default class ProcessWorks {
    constructor() {
        if (IS_PRODUCTION) this._configureReport();
        this._init();
    }

    // Конфигурация Diagnostic Report - детальная информация об ошибке
    private _configureReport() {
        // Создаём директорию для отчётов, если её нет
        if (!fs.existsSync(REPORTS_PATH)) {
            fs.mkdirSync(REPORTS_PATH);
        }

        process.report.directory = REPORTS_PATH;          // Путь к папке, в которой будут генерироваться отчеты
        process.report.reportOnSignal = true;             // Будет ли генерироваться отчет, если процесс Node.js завершиться из-за сигнала
        process.report.reportOnFatalError = true;         // Будет ли генерироваться отчет в случае фатальной ошибки в процессе Node.js
        process.report.reportOnUncaughtException = true;  // Будет ли генерироваться отчёт в случае необработанной исключительной ситуации
    }

    private _init() {
        // Обрабатываем пробрасываемые исключения синхронного кода
        process.on("uncaughtException", (error: Error) => {
            this._handleError(t("error.unhandled_sync", { errorMessage: error.message }), "exception");
        });

        // Обрабатываем пробрасываемые исключения асинхронного кода
        process.on("unhandledRejection", (reason: string, promise: Promise<unknown>) => {
            this._handleError(t("error.unhandled_async", { reason, promise: promise.toString() }), "rejection");
        });
    }

    // Обработка возникшей ошибки
    private _handleError(error: string, reportReason: string) {
        new BaseError(error);

        // Генерируем отчет об необработанной ошибке
        if (IS_PRODUCTION) this._generateReport(reportReason);

        // Завершаем выполнение процесса NodeJS
        process.exit(1);
    }

    // Генерация отчета с ошибкой, с учетом timestamp
    private _generateReport(reason: string) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const reportFilePath = `report-${reason}-${timestamp}.json`;

        process.report.writeReport(reportFilePath);
    }
}