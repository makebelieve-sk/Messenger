import { type ChildProcessByStdio, spawn } from "child_process";
import schedule from "node-schedule";
import type internal from "stream";

import { t } from "@service/i18n";
import Logger from "@service/logger";
import ProcessWorks from "@service/Process";
import { BACKUP_JOB_SCHEDULE, IS_DEV } from "@utils/constants";

const logger = Logger("spawn-backup-process");
const BACKUP_RUN_COMMAND = IS_DEV ? "backup" : "backup:prod";

let backupProcess: ChildProcessByStdio<null, internal.Readable, internal.Readable> | null = null;

// Запуск скрипта резервного копирования
function spawnProcess() {
	logger.info(t("backup_job_schedule.spawn_new_process"));

	// Запускаем скрипт резервного копирования в дочернем процессе
	backupProcess = spawn("npm", [ "run", BACKUP_RUN_COMMAND ], {
		stdio: [ "ignore", "pipe", "pipe" ], // stdin: ignore, stdout: pipe, stderr: pipe
		shell: true, // Включаем поддержку команд в shell (для Windows). Иначе не может найти npm
	});

	// Обработка потока вывода сообщения (отправленного через console.log)
	backupProcess.stdout.on("data", (data: string) => {
		logger.info(`[Backup | Process with pid=${backupProcess?.pid}]: ${data}`);
	});

	// Обработка потока вывода ошибки (отправленного через console.error)
	backupProcess.stderr.on("data", (data: string) => {
		logger.error(`[Backup Error | Process with pid=${backupProcess?.pid}]: ${data}`);
	});

	// Обработка завершения процесса (при вызове process.exit(КОД завершения))
	backupProcess.on("close", (code) => {
		logger.info(`Backup process exited with code ${code}`);
		backupProcess = null; // Сброс ссылки на процесс
	});
};

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
const job = schedule.scheduleJob(BACKUP_JOB_SCHEDULE, () => {
	logger.info(t("backup_job_schedule.started"));
	spawnProcess();
});

// Функция для остановки задания
function stopJob() {
	if (job) {
		logger.info(t("backup_job_schedule.stopped"));
		job.cancel(); // Отменяем задание
	}

	// Если backupProcess существует, завершаем его
	if (backupProcess && !backupProcess.killed) {
		backupProcess.kill("SIGTERM");
		logger.info(t("backup_job_schedule.process_killed", { pid: (backupProcess.pid || "undefined").toString() }));
	}
}

// Обработка сигналов главного процесса для остановки задания
ProcessWorks.registerCleanupTask(stopJob);