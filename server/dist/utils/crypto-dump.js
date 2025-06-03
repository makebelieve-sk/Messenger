"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDecryptStream = exports.createEncryptStream = void 0;
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const stream_1 = require("stream");
const constants_1 = require("@utils/constants");
const ALGORITHM = "aes-256-cbc";
const METADATA_FILE = "metadata.json";
// Шифрование резервной копии базы данных
const createEncryptStream = async (dumpPath) => {
    // Генерируем случайный salt и ключ
    const salt = (0, crypto_1.randomBytes)(16);
    const key = (0, crypto_1.scryptSync)(constants_1.DATABASE_ENCRYPTION_PASSWORD, salt, 32);
    const iv = (0, crypto_1.randomBytes)(16);
    // Создаем метаданные
    const metadata = {
        salt: salt.toString("hex"),
        iv: iv.toString("hex"),
        timestamp: new Date().toISOString(),
    };
    // Сохраняем метаданные в файл
    await (0, promises_1.writeFile)((0, path_1.join)(dumpPath, METADATA_FILE), JSON.stringify(metadata), "utf-8");
    // Создаем шифрователь и шифруем данные
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
    // Создаем поток преобразования для шифрования данных
    return new stream_1.Transform({
        transform(chunk, _, callback) {
            try {
                const encrypted = cipher.update(chunk);
                if (encrypted.length) {
                    this.push(encrypted);
                }
                callback();
            }
            catch (err) {
                callback(err);
            }
        },
        flush(callback) {
            try {
                const final = cipher.final();
                if (final.length) {
                    this.push(final);
                }
                callback();
            }
            catch (err) {
                callback(err);
            }
        },
    });
};
exports.createEncryptStream = createEncryptStream;
// Расшифровка резервной копии базы данных
const createDecryptStream = async (dumpPath) => {
    // Читаем метаданные из файла
    const metadataFile = await (0, promises_1.readFile)((0, path_1.join)(dumpPath, METADATA_FILE), "utf-8");
    const metadata = JSON.parse(metadataFile);
    // Генерируем ключ и создаем дешифратор
    const key = (0, crypto_1.scryptSync)(constants_1.DATABASE_ENCRYPTION_PASSWORD, Buffer.from(metadata.salt, "hex"), 32);
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, Buffer.from(metadata.iv, "hex"));
    // Дешифруем данные в потоке преобразования
    return new stream_1.Transform({
        transform(chunk, _, callback) {
            try {
                const decrypted = decipher.update(chunk);
                if (decrypted.length) {
                    this.push(decrypted);
                }
                callback();
            }
            catch (err) {
                callback(err);
            }
        },
        /**
         * Данный метод вызывается автоматически при завершении потока.
         * Завершаем дешифровку и отправляет данные в коллбек перед закрытием потока.
         */
        flush(callback) {
            try {
                const final = decipher.final();
                if (final.length) {
                    this.push(final);
                }
                callback();
            }
            catch (err) {
                callback(err);
            }
        },
    });
};
exports.createDecryptStream = createDecryptStream;
//# sourceMappingURL=crypto-dump.js.map