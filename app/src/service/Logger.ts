import { DebuggerType } from "../types/enums";
import { ARRAY_LOGS_LENGTH, DEV, LOGS_FILE_NAME } from "../utils/constants";

// Главное название лога
const APP_NAME = "APP";
// Генерируем имя файла с timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");   // Пример: 2023-10-10T12-34-56-789Z

// Класс, отвечающий за логирование на клиенте. Сохраняет логи в массив для будущего скачивания (в модальном окне ошибки)
export default class Logger {
    private _arrayLogs: string[] = [];
    private _prefix: string = "";
    protected static instance: Logger;

    private constructor() {}

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

    protected set prefix(prefix: string) {
        this._prefix = prefix;
    }

    // Установка полного префикса для записи логгера
    private _getDebugger(type: DebuggerType = DebuggerType.DEBUG) {
        const typeString = type ? `:${type}` : type;
        const prefix = this._prefix ? `:${this._prefix}` : "";

        return (message: string) => {
            // При достижении большого количества записей в массиве - очищаем массив
            if (this._arrayLogs.length > ARRAY_LOGS_LENGTH) {
                this._arrayLogs.length = 0;
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

            // Записываем строку из логгера в массив
            this._arrayLogs.push(`[${timestamp}] ${APP_NAME}${typeString}${prefix} | ${message}`);
        };
    }

    // Статичный метод, реализует паттерн "Синглтон", то есть воззвращает один и тот же инстанс класса Logger в любом случае
    static init(prefix: string = "") {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }

        Logger.instance.prefix = prefix;
    
        return Logger.instance;
    }

    // Скачиваем файл с ранее записанными логами
    downloadToFile() {
        if (this._arrayLogs.length) {
            // Создание Blob объекта со строчными данными в формате обычного текста
            const blob = new Blob([this._arrayLogs.join("\n")], { type: "text/plain" });

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