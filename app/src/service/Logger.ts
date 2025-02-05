import { DebuggerType } from "@custom-types/enums";
import { ARRAY_LOGS_LENGTH, DEV, LOGS_FILE_NAME } from "@utils/constants";

const APP_NAME = "APP";             // Главное название лога
const arrayLogs: string[] = [];     // Массив всех логов, максимум определяется .env переменной ARRAY_LOGS_LENGTH

// Класс, отвечающий за логирование на клиенте. Сохраняет логи в массив для будущего скачивания (в модальном окне ошибки)
export default class Logger {
    private constructor(private readonly _prefix: string) {}

    get debug() {
        return this._getDebugger();
    }

    get info() {
        return this._getDebugger(DebuggerType.INFO);
    }

    get warn() {
        return this._getDebugger(DebuggerType.WARN);
    }

    get error() {
        return this._getDebugger(DebuggerType.ERROR);
    }

    // Установка полного префикса для записи логгера
    private _getDebugger(type: DebuggerType = DebuggerType.DEBUG) {
        const typeString = type ? `:${type}` : type;
        const prefix = this._prefix ? `:${this._prefix}` : "";

        return (message: string) => {
            // При достижении большого количества записей в массиве - очищаем массив
            if (arrayLogs.length > ARRAY_LOGS_LENGTH) {
                arrayLogs.length = 0;
            }

            switch (type) {
                case DebuggerType.DEBUG:
                    break;
                case DebuggerType.INFO:
                    if (DEV) console.log(message);
                    break;
                case DebuggerType.WARN:
                    console.warn(message);
                    break;
                case DebuggerType.ERROR:
                    console.error(message);
                    break;
                default:
                    break;
            }

            // Генерируем имя файла с timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");   // Пример: 2023-10-10T12-34-56-789Z

            // Записываем строку из логгера в массив
            arrayLogs.push(`[${timestamp}] ${APP_NAME}${typeString}${prefix} | ${message}`);
        };
    }

    // Статичный метод, реализует паттерн "Фабрика"
    static init(prefix: string = "") {
        return new Logger(prefix);
    }

    // Скачиваем файл с ранее записанными логами
    downloadToFile() {
        if (arrayLogs.length) {
            // Создание Blob объекта со строчными данными в формате обычного текста
            const blob = new Blob([arrayLogs.join("\n")], { type: "text/plain" });

            // Формирование элемента
            const link = document.createElement("a");

            // Указание данных для скачивания
            link.href = URL.createObjectURL(blob);

            // Имя файла
            link.download = LOGS_FILE_NAME;

            // Симулируем нажатие на ссылку
            link.click();

            // Освобождаем URL
            URL.revokeObjectURL(link.href);
        }
    }
}