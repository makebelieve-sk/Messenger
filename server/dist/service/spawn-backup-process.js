"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const node_schedule_1 = __importDefault(require("node-schedule"));
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const Process_1 = __importDefault(require("@service/Process"));
const constants_1 = require("@utils/constants");
const logger = (0, logger_1.default)("spawn-backup-process");
const BACKUP_RUN_COMMAND = constants_1.IS_DEV ? "backup" : "backup:prod";
let backupProcess = null;
// Запуск скрипта резервного копирования
function spawnProcess() {
    logger.info((0, i18n_1.t)("backup_job_schedule.spawn_new_process"));
    // Запускаем скрипт резервного копирования в дочернем процессе
    backupProcess = (0, child_process_1.spawn)("npm", ["run", BACKUP_RUN_COMMAND], {
        stdio: ["ignore", "pipe", "pipe"], // stdin: ignore, stdout: pipe, stderr: pipe
        shell: true, // Включаем поддержку команд в shell (для Windows). Иначе не может найти npm
    });
    // Обработка потока вывода сообщения (отправленного через console.log)
    backupProcess.stdout.on("data", (data) => {
        logger.info(`[Backup | Process with pid=${backupProcess?.pid}]: ${data}`);
    });
    // Обработка потока вывода ошибки (отправленного через console.error)
    backupProcess.stderr.on("data", (data) => {
        logger.error(`[Backup Error | Process with pid=${backupProcess?.pid}]: ${data}`);
    });
    // Обработка завершения процесса (при вызове process.exit(КОД завершения))
    backupProcess.on("close", (code) => {
        logger.info(`Backup process exited with code ${code}`);
        backupProcess = null; // Сброс ссылки на процесс
    });
}
;
/**
 * Запуск задания на выполнение скрипта резервного копирования данных из базы данных MS SQL
 * в дочернем процессе каждый месяц в 00:00:00 1 числа каждого месяца.
 * Расшифровка расписания:
 * 0 — 0-я секунда.
 * 0 — 0-я минута.
 * 0 — 0-й час (00:00).
 * 1 — 1-е число месяца.
 * * — любой месяц.
 * * — любой день недели.
 */
const job = node_schedule_1.default.scheduleJob(constants_1.BACKUP_JOB_SCHEDULE, () => {
    logger.info((0, i18n_1.t)("backup_job_schedule.started"));
    spawnProcess();
});
// Функция для остановки задания
function stopJob() {
    if (job) {
        logger.info((0, i18n_1.t)("backup_job_schedule.stopped"));
        job.cancel(); // Отменяем задание
    }
    // Если backupProcess существует, завершаем его
    if (backupProcess && !backupProcess.killed) {
        backupProcess.kill("SIGTERM");
        logger.info((0, i18n_1.t)("backup_job_schedule.process_killed", { pid: (backupProcess.pid || "undefined").toString() }));
    }
}
// Обработка сигналов главного процесса для остановки задания
Process_1.default.registerCleanupTask(stopJob);
//# sourceMappingURL=spawn-backup-process.js.map