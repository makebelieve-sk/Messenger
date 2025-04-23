// eslint-disable-next-line simple-import-sort/imports
import "@service/env";

import { existsSync } from "fs";
import { readdir, unlink } from "fs/promises";
import { join } from "path";
import { QueryTypes, Sequelize } from "sequelize";
import { isMainThread, parentPort } from "worker_threads";

import mssqlConfig from "@config/mssql.config";
import { type IPhoto } from "@custom-types/models.types";
import { ASSETS_DIR } from "@utils/constants";
import { type IWorkerData } from "@service/delete-unused-files";

const ASSETS_FOLDER = join(__dirname, "../", ASSETS_DIR);
const AVATARS_FOLDER = join(ASSETS_FOLDER, "avatars");
// const FILES_FOLDER = join(ASSETS_FOLDER, "files");
const PHOTOS_FOLDER = join(ASSETS_FOLDER, "photos");

// Удаление неиспользуемых файлов, в том числе фотографий (чаты/профиль), аватаров и файлов (чаты)
async function main() {
	const sequelize = new Sequelize(mssqlConfig);

	// Проверяем существование папки с файлами проекта
	if (!existsSync(ASSETS_FOLDER)) {
		throw new Error("Assets FOLDER does not exist");
	}

	const filesToRead = [
		readdir(AVATARS_FOLDER),
		// readdir(FILES_FOLDER),
		readdir(PHOTOS_FOLDER),
	];

	// Получаем список файлов из всех указанных папок с файлами проекта
	const files = await Promise
		.all(filesToRead)
		.then(([ avatars, photos ]) => {
			return [
				...avatars.map(avatar => `\\avatars\\${avatar}`),
				// ...files.map(file => `\\files\\${file}`),
				...photos.map(photo => `\\photos\\${photo}`),
			];
		});

	// Проверяем существование в БД (пачками по 1000)
	const chunkSize = 1000;
	const existingFiles = new Set();

	// Получаем список файлов из БД батчингом, чтобы не грузить сильно базу данных
	for (let i = 0; i < files.length; i += chunkSize) {
		const chunk = files
			.slice(i, i + chunkSize)
			.map(file => `'${file.replace(/'/g, "''")}'`) // Экранируем кавычки
			.join(",");

		const photos: IPhoto[] = await sequelize.query(`
            SELECT path 
            FROM Photos 
            WHERE path IN (${chunk})
        `, {
			type: QueryTypes.SELECT,
		});

		photos.forEach(photo => existingFiles.add(photo.path));
	}

	// Фильтруем файлы для удаления
	const filesToDelete = files.filter(file => !existingFiles.has(file));

	// Параллельное удаление файлов
	await Promise.all(
		filesToDelete.map(file =>
			unlink(join(ASSETS_FOLDER, file))
				.catch((error: Error) => {
					throw new Error(`Error deleting ${file}:${error}`);
				}),
		),
	);

	// Закрываем соединение с БД
	await sequelize.close();

	return filesToDelete.length;
}

// Проверка запуска файла в отдельном потоке
if (!isMainThread && parentPort) {
	parentPort.on("message", async () => {
		try {
			// Выполнение очистки неиспользуемых файлов
			const result = await main();
			// Отправка данных в главный поток
            parentPort!.postMessage({ success: true, count: result } as IWorkerData);
			// Завершение работы дочернего воркера
            process.exit(0);
		} catch (error) {
			// Отправка ошибки в главный поток
            parentPort!.postMessage({ success: false, error: (error as Error).message } as IWorkerData);
			// Завершение работы дочернего воркера с кодом 1, что означает ошибочное завершение работы дочернего воркера
            process.exit(1);
		}
	});
} else {
	// eslint-disable-next-line no-console
	console.warn("Этот файл должен быть запущен в отдельном потоке!");
}