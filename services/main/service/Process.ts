import fs from "fs";
import path from "path";

import type MainServer from "@core/MainServer";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { BaseError } from "@errors/index";
import { IS_DEV, REPORTS_DIR } from "@utils/constants";
import { timestamp } from "@utils/datetime";

const logger = Logger("Process");

const signals = [ "SIGINT", "SIGTERM", "SIGUSR2" ] as NodeJS.Signals[];
const REPORTS_PATH = path.join(__dirname, "../", REPORTS_DIR);

/**
 * Класс, предоставляет обертку над обработкой всех возможных ошибок (как синхронных, так и асинхронных). 
 * При этом, генерирует отчет о необработанных ошибках.
 */
export default class ProcessWorks {
	private _mainServer!: MainServer;
	static cleanupTasks: (() => Promise<void> | void)[] = [];

	constructor() {
		if (!IS_DEV) this._configureReport();
		this._init();
	}

	// Добавление новой задачи/джобы для остановки в процессе остановки сервера
	static registerCleanupTask(cb: (() => Promise<void>) | (() => void)) {
		ProcessWorks.cleanupTasks.push(cb);
	}

	// Установка сервера
	setServer(mainServer: MainServer) {
		this._mainServer = mainServer;

		this._registerShutdownSignals();
	}

	// Остановка сервера с ошибкой
	async stopServerWithError() {
		await this._shutdown(1);
	}

	// Конфигурация Diagnostic Report - детальная информация об ошибке
	private _configureReport() {
		logger.debug("_configureReport");

		// Создаём директорию для отчётов, если её нет
		if (!fs.existsSync(REPORTS_PATH)) {
			fs.mkdirSync(REPORTS_PATH);
		}

		process.report.directory = REPORTS_PATH; // Путь к папке, в которой будут генерироваться отчеты
		process.report.reportOnSignal = true; // Будет ли генерироваться отчет, если процесс Node.js завершиться из-за сигнала
		process.report.reportOnFatalError = true; // Будет ли генерироваться отчет в случае фатальной ошибки в процессе Node.js
		process.report.reportOnUncaughtException = true; // Будет ли генерироваться отчёт в случае необработанной исключительной ситуации
	}

	private _init() {
		logger.debug("_init");

		// Обрабатываем пробрасываемые исключения синхронного кода
		process.on("uncaughtException", async (error: Error) => {
			await this._handleError(t("error.unhandled_sync", { errorMessage: error.toString() }), "exception");
		});

		// Обрабатываем пробрасываемые исключения асинхронного кода
		process.on("unhandledRejection", async (reason: string, promise: Promise<unknown>) => {
			await this._handleError(t("error.unhandled_async", { reason, promise: promise.toString() }), "rejection");
		});
	}

	// Обработка возникшей ошибки
	private async _handleError(error: string, reportReason: string) {
		new BaseError(error);

		// Генерируем отчет об необработанной ошибке
		if (!IS_DEV) this._generateReport(reportReason);

		await this._shutdown(1);
	}

	// Генерация отчета с ошибкой, с учетом timestamp
	private _generateReport(reason: string) {
		logger.debug("_generateReport");

		const reportFilePath = `report-${reason}-${timestamp}.json`;

		process.report.writeReport(reportFilePath);
	}

	// Обработка остановки сервера
	private async _shutdown(exitCode: number) {
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

			logger.info(t("process.close_server", { code: exitCode.toString() }));
		} catch (error) {
			logger.error(t("process.error.close_server", { error: (error as Error).message }));
			new BaseError((error as Error).message);
		} finally {
			// Завершаем выполнение процесса NodeJS
			process.exit(exitCode);
		}
	}

	// Ручное управление остановкой сервера
	private _registerShutdownSignals() {
		const handleSignal = (signal: NodeJS.Signals) => async () => {
			logger.info(t("process.get_signal_before_close", { signal }));

			if (signal === signals[2]) {
				// Для nodemon: пересылаем назад после очистки
				await this._shutdown(0);
				process.kill(process.pid, signals[2]);
			} else {
				await this._shutdown(0);
			}
		};

		// Регистрируем лишь один обработчик для каждого сигнала
		signals.forEach(sig => {
			process.once(sig, handleSignal(sig));
		});
	}
}
