import schedule from "node-schedule";
import { join } from "path";
import { Worker } from "worker_threads";

import { t } from "@service/i18n";
import Logger from "@service/logger";
import ProcessWorks from "@service/Process";
import { DELETE_UNUSED_FILES_JOB_SCHEDULE, IS_DEV } from "@utils/constants";

export interface IWorkerData {
    success: boolean;
    count?: number; 
    error?: string;
};

const logger = Logger("delete-un-used-files");

const WORKER_DIR = IS_DEV ? "../scripts/delete-unused-images.ts" : "../scripts/delete-unused-images.js";
const workerOptions = IS_DEV 
	? [ "-r", "tsconfig-paths/register", "-r", "ts-node/register" ] 
	: [ "-r", "module-alias/register" ];
let worker: Worker | null = null;

// Запуск отдельного воркера на выполнение удаления неиспользуемых файлов из папок проекта (assets/...)
function startWorker() {
	return new Promise<void>((resolve, reject) => {
		// Создание дочернего воркера
		worker = new Worker(join(__dirname, WORKER_DIR), {
			execArgv: workerOptions, // Необходимо прокинуть явно параметры запуска для .ts и .js разрешения
		});

		// Подписка на событие сообщения дочернего воркера
		worker.on("message", ({ success, count, error }: IWorkerData) => {
			if (success) {
				logger.info(t("delete_unused_files_job_schedule.finished", { count: count?.toString() || "0" }));
				resolve();
			} else {
				reject(new Error(error));
			}
		});

		// Подписка на событие ошибки дочернего воркера
		worker.on("error", (error: Error) => {
			const nextError = error instanceof Error 
				? error 
				: new Error(error);

			reject(nextError);
			worker = null;
		});

		// Подписка на событие завершения дочернего воркера
		worker.on("exit", (code) => {
			if (code !== 0) {
				logger.error(t("delete_unused_files_job_schedule.full_stop", { 
					code: code.toString(), 
					threadId: worker?.threadId.toString() || "already closed", 
				}));
			} else {
				logger.info(t("delete_unused_files_job_schedule.success_stopped"));
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
const job = schedule.scheduleJob(DELETE_UNUSED_FILES_JOB_SCHEDULE, async () => {
	try {
		logger.info(t("delete_unused_files_job_schedule.started"));
		await startWorker();
	} catch (error) {
		logger.error(t("delete_unused_files_job_schedule.error", { error: (error as Error).message }));
		await stopWorker();
	}
});

// Функция для остановки воркера
async function stopWorker() {
	if (worker && worker.threadId !== undefined) {
		logger.warn(t("delete_unused_files_job_schedule.terminate", { threadId: worker.threadId.toString() }));
		await worker.terminate();
		worker = null;
	}
}

// Функция для остановки задания
async function stopJob() {
	if (job) {
		logger.info(t("delete_unused_files_job_schedule.stopped"));
		job.cancel(); // Отменяем задание
	}

	await stopWorker(); // Останавливаем воркер
}

// Обработка сигналов главного процесса для остановки задания
ProcessWorks.handleSignals(stopJob);