"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_schedule_1 = __importDefault(require("node-schedule"));
const path_1 = require("path");
const worker_threads_1 = require("worker_threads");
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const Process_1 = __importDefault(require("@service/Process"));
const constants_1 = require("@utils/constants");
;
const logger = (0, logger_1.default)("delete-un-used-files");
const WORKER_DIR = constants_1.IS_DEV ? "../scripts/delete-unused-images.ts" : "../scripts/delete-unused-images.js";
const workerOptions = constants_1.IS_DEV
    ? ["-r", "tsconfig-paths/register", "-r", "ts-node/register"]
    : ["-r", "module-alias/register"];
let worker = null;
// Запуск отдельного воркера на выполнение удаления неиспользуемых файлов из папок проекта (assets/...)
function startWorker() {
    return new Promise((resolve, reject) => {
        // Создание дочернего воркера
        worker = new worker_threads_1.Worker((0, path_1.join)(__dirname, WORKER_DIR), {
            execArgv: workerOptions, // Необходимо прокинуть явно параметры запуска для .ts и .js разрешения
        });
        // Подписка на событие сообщения дочернего воркера
        worker.on("message", ({ success, count, error }) => {
            if (success) {
                logger.info((0, i18n_1.t)("delete_unused_files_job_schedule.finished", { count: count?.toString() || "0" }));
                resolve();
            }
            else {
                reject(new Error(error));
            }
        });
        // Подписка на событие ошибки дочернего воркера
        worker.on("error", (error) => {
            const nextError = error instanceof Error
                ? error
                : new Error(error);
            reject(nextError);
            worker = null;
        });
        // Подписка на событие завершения дочернего воркера
        worker.on("exit", (code) => {
            if (code !== 0) {
                logger.error((0, i18n_1.t)("delete_unused_files_job_schedule.full_stop", {
                    code: code.toString(),
                    threadId: worker?.threadId.toString() || "already closed",
                }));
            }
            else {
                logger.info((0, i18n_1.t)("delete_unused_files_job_schedule.success_stopped"));
            }
            worker = null;
        });
        // Отправка сообщения дочернему воркеру для запуска скрипта
        worker.postMessage("start");
    });
}
/**
 * Запуск задания на удаление неиспользуемых файлов проекта.
 * в дочернем процессе каждый месяц в 00:00:00 1 числа каждого месяца.
 * Расшифровка расписания:
 * 0 — 0-я секунда.
 * 0 — 0-я минута.
 * 0 — 0-й час (00:00).
 * 1 — 1-е число месяца.
 * * — любой месяц.
 * * — любой день недели.
 */
const job = node_schedule_1.default.scheduleJob(constants_1.DELETE_UNUSED_FILES_JOB_SCHEDULE, async () => {
    try {
        logger.info((0, i18n_1.t)("delete_unused_files_job_schedule.started"));
        await startWorker();
    }
    catch (error) {
        logger.error((0, i18n_1.t)("delete_unused_files_job_schedule.error", { error: error.message }));
        await stopWorker();
    }
});
// Функция для остановки воркера
async function stopWorker() {
    if (worker && worker.threadId !== undefined) {
        logger.warn((0, i18n_1.t)("delete_unused_files_job_schedule.terminate", { threadId: worker.threadId.toString() }));
        await worker.terminate();
        worker = null;
    }
}
// Функция для остановки задания
async function stopJob() {
    if (job) {
        logger.info((0, i18n_1.t)("delete_unused_files_job_schedule.stopped"));
        job.cancel(); // Отменяем задание
    }
    await stopWorker(); // Останавливаем воркер
}
// Обработка сигналов главного процесса для остановки задания
Process_1.default.registerCleanupTask(stopJob);
//# sourceMappingURL=delete-unused-files.js.map