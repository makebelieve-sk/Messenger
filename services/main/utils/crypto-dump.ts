import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { Transform, type TransformCallback } from "stream";

import { DATABASE_ENCRYPTION_PASSWORD } from "@utils/constants";

const ALGORITHM = "aes-256-cbc";
const METADATA_FILE = "metadata.json";

// Шифрование резервной копии базы данных
export const createEncryptStream = async (dumpPath: string) => {
	// Генерируем случайный salt и ключ
	const salt = randomBytes(16);
	const key = scryptSync(DATABASE_ENCRYPTION_PASSWORD, salt, 32);
	const iv = randomBytes(16);

	// Создаем метаданные
	const metadata = {
		salt: salt.toString("hex"),
		iv: iv.toString("hex"),
		timestamp: new Date().toISOString(),
	};

	// Сохраняем метаданные в файл
	await writeFile(join(dumpPath, METADATA_FILE), JSON.stringify(metadata), "utf-8");

	// Создаем шифрователь и шифруем данные
	const cipher = createCipheriv(ALGORITHM, key, iv);

	// Создаем поток преобразования для шифрования данных
	return new Transform({
		transform(chunk: Buffer, _: BufferEncoding, callback: TransformCallback) {
			try {
				const encrypted = cipher.update(chunk);

				if (encrypted.length) {
					this.push(encrypted);
				}

				callback();
			} catch (err) {
				callback(err as Error);
			}
		},
		flush(callback: TransformCallback) {
			try {
				const final = cipher.final();

				if (final.length) {
					this.push(final);
				}

				callback();
			} catch (err) {
				callback(err as Error);
			}
		},
	});
};

// Расшифровка резервной копии базы данных
export const createDecryptStream = async (dumpPath: string) => {
	// Читаем метаданные из файла
	const metadataFile = await readFile(join(dumpPath, METADATA_FILE), "utf-8");
	const metadata = JSON.parse(metadataFile);
	// Генерируем ключ и создаем дешифратор
	const key = scryptSync(DATABASE_ENCRYPTION_PASSWORD, Buffer.from(metadata.salt, "hex"), 32);
	const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(metadata.iv, "hex"));

	// Дешифруем данные в потоке преобразования
	return new Transform({
		transform(chunk: Buffer, _: BufferEncoding, callback: TransformCallback) {
			try {
				const decrypted = decipher.update(chunk);

				if (decrypted.length) {
					this.push(decrypted);
				}

				callback();
			} catch (err) {
				callback(err as Error);
			}
		},
		/**
		 * Данный метод вызывается автоматически при завершении потока.
		 * Завершаем дешифровку и отправляет данные в коллбек перед закрытием потока.
		 */
		flush(callback: TransformCallback) {
			try {
				const final = decipher.final();

				if (final.length) {
					this.push(final);
				}

				callback();
			} catch (err) {
				callback(err as Error);
			}
		},
	});
};