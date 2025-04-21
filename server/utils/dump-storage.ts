import { existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

import { DATABASE_MAX_BACKUPS } from "@utils/constants";
import { getAllSortedByTimestampFolders } from "@utils/files";

const DUMP_DIR = join(__dirname, "../dumps");

/**
 * Функция для подготовки папки с резервной копией.
 * Если максимальное количество папок с резервными копиями базы данных уже есть, 
 * то перезаписываем самую старую резервную копию, чтобы не засорять диск.
 */
export function prepareDumpFolder() {
	// Если папка с резервными копиями базы данных не существует, то создаем ее
	if (!existsSync(DUMP_DIR)) mkdirSync(DUMP_DIR);

	// Получаем все папки с резервными копиями базы данных
	const folders = getAllSortedByTimestampFolders(DUMP_DIR);

	// Если папок с резервными копиями базы данных больше максимального количества, то удаляем самую старую
	while (folders.length >= DATABASE_MAX_BACKUPS) {
		// rmSync рекурсивно удаляет вложенные файлы и папки
		rmSync(join(DUMP_DIR, folders[0]), { recursive: true });
		folders.shift();
	}

	// Создаем новую папку для резервной копии
	const newFolder = `dump_${Date.now()}`;
	mkdirSync(join(DUMP_DIR, newFolder));

	return join(DUMP_DIR, newFolder);
};