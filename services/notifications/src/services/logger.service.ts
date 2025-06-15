import {
	createWriteStream,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	unlinkSync,
	WriteStream,
} from "fs";
import { join } from "path";
import {
	ConsoleLogger,
	Injectable,
	LoggerService,
	Scope,
} from "@nestjs/common";

const MAX_LINES = 5000;
const MAX_FILES = 5;
const LOG_DIR = join(__dirname, "../", "logs");

// Транзиентный логгер с ротацией по строкам и ограничением по количеству файлов
@Injectable({ scope: Scope.TRANSIENT })
export default class FileLogger extends ConsoleLogger implements LoggerService {
	// Статические ресурсы, общие для всех экземпляров
	private static initialized = false;
	private static currentFilePath: string;
	private static lineCount: number;
	private static logStream: WriteStream;

	constructor(context: string) {
		super(context);

		// Инициализируем файловый логгер только один раз
		if (!FileLogger.initialized) {
			mkdirSync(LOG_DIR, { recursive: true });

			// Найти существующий файл или создать новый
			const files = readdirSync(LOG_DIR)
				.filter((f) => f.endsWith(".log"))
				.map((f) => ({
					name: f,
					time: statSync(join(LOG_DIR, f)).birthtimeMs,
				}))
				.sort((a, b) => b.time - a.time);

			if (!files.length) {
				FileLogger.currentFilePath = this.createNewLogFile();
				FileLogger.lineCount = 0;
			} else {
				const latest = files[0].name;
				const latestPath = join(LOG_DIR, latest);
				const data = readFileSync(latestPath, "utf8");
				const count = data.split("\n").filter(Boolean).length;

				if (count >= MAX_LINES) {
					FileLogger.currentFilePath = this.createNewLogFile();
					FileLogger.lineCount = 0;
				} else {
					FileLogger.currentFilePath = latestPath;
					FileLogger.lineCount = count;
				}
			}

			FileLogger.logStream = createWriteStream(FileLogger.currentFilePath, {
				flags: "a",
			});
			FileLogger.initialized = true;
		}
	}

	override log(message: string) {
		super.log(message);
		this.writeToFile("LOG", message);
	}

	override error(message: string, trace?: string | Error) {
		super.error(message, trace);
		const full = trace ? `${message} → ${trace}` : message;
		this.writeToFile("ERROR", full);
	}

	override warn(message: string) {
		super.warn(message);
		this.writeToFile("WARN", message);
	}

	override debug(message: string) {
		super.debug(message);
		this.writeToFile("DEBUG", message);
	}

	override verbose(message: string) {
		super.verbose(message);
		this.writeToFile("VERBOSE", message);
	}

	// Запись данных в файл логов поток записи
	private writeToFile(level: string, message: string) {
		const timestamp = new Date().toISOString();
		const msg =
			typeof message === "string" ? message : JSON.stringify(message, null, 2);

		FileLogger.logStream.write(
			`${timestamp} ${level} [${this.context}] ${msg}\n`,
		);
		FileLogger.lineCount++;

		if (FileLogger.lineCount >= MAX_LINES) {
			this.rotateLogFile();
		}
	}

	// Создаем новый файл логов
	private createNewLogFile(): string {
		// Создаёт файл с timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const filename = `logs-${timestamp}.log`;
		const filePath = join(LOG_DIR, filename);

		this.cleanupOldFiles();

		return filePath;
	}

	// Закрываем поток записи, создаем новый файл логов и запускаем новый поток записи
	private rotateLogFile() {
		FileLogger.logStream.end();
		FileLogger.currentFilePath = this.createNewLogFile();
		FileLogger.lineCount = 0;
		FileLogger.logStream = createWriteStream(FileLogger.currentFilePath, {
			flags: "a",
		});
	}

	// Удаляет старые файлы
	private cleanupOldFiles() {
		const files = readdirSync(LOG_DIR)
			.filter((f) => f.endsWith(".log"))
			.map((f) => ({
				name: f,
				time: statSync(join(LOG_DIR, f)).birthtimeMs,
			}))
			.sort((a, b) => a.time - b.time);

		while (files.length >= MAX_FILES) {
			const fileToRemove = files.shift();

			if (fileToRemove) {
				unlinkSync(join(LOG_DIR, fileToRemove.name));
			}
		}
	}

	// Закрытие потока при завершении
	close() {
		if (FileLogger.initialized) {
			FileLogger.logStream.end();
			FileLogger.initialized = false;
		}
	}
}
