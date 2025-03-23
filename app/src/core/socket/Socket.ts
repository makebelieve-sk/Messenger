import EventEmitter from "eventemitter3";
import { io } from "socket.io-client";

import SocketController from "@core/socket/SocketController";
import { validateEmitEvent } from "@core/socket/validation";
import Logger from "@service/Logger";
import i18next from "@service/i18n";
import { SOCKET_RECONECTION_ATTEMPTS, SOCKET_RECONNECTION_DELAY, SOCKET_URL, SOCKET_ACK_TIMEOUT } from "@utils/constants";
import { AppDispatch } from "@custom-types/redux.types";
import { ClientToServerEvents, SocketType } from "@custom-types/socket.types";
import { MainClientEvents, SocketEvents } from "@custom-types/events";

const logger = Logger.init("Socket");

// Класс, являющийся оберткой для socket.io-client, позволяющий давать запросы на сервер по протоколу ws через транспорт websocket
export default class Socket extends EventEmitter {
    private _socket!: SocketType;
    private _socketController!: SocketController;
    private _myId!: string;

    constructor(private readonly _dispatch: AppDispatch) {
        super();
    }

    init(myId: string) {
        logger.debug("init");

        this._myId = myId;

        if (!this._myId) {
            this.emit(MainClientEvents.ERROR, i18next.t("core.socket.error.user_not_exists"));
            return;
        }

        this._socket = io(SOCKET_URL, { 
            transports: ["websocket"],                  // Виды транспортов (идут один за другим по приоритету, данный массив на сервере должен совпадать)
            autoConnect: false,                         // Автоматически подключаться при создании экземпляра клиента (без вызова connect())
            reconnection: true,                         // Включаем автоматическое переподключения для учитывания попыток и задержки
            reconnectionAttempts: SOCKET_RECONECTION_ATTEMPTS, // Количество попыток переподключения перед тем, как закрыть соединение
            reconnectionDelay: SOCKET_RECONNECTION_DELAY,      // Задержка между попытками переподключения
            forceNew: false,                            // Не создает новое соединение, если оно уже существует
            upgrade: true,                              // Позволяет улучшать соединение с polling до websocket (в нашем случае улучшается с первого http-запроса (handshake) до websocket)
            closeOnBeforeunload: true,                  // Позволяет сокет соединению автоматически закрываться при событии beforeunload (закрытие вкладки/браузера/обновление страницы)
            withCredentials: true                       // Включает передачу куки при кросс-доменных запросах (работает только с аналогичным параметром на сервере)
        });

        this._connect();

        this._socketController = new SocketController(this._socket, this._dispatch, this._myId);

        this._bindSocketControllerListeners();
    }

    // Основной метод отправки события с клиента на сервер с добавлением ack (подтверждение обработки сервером данного события)
    // Необходимо корректно указать тип аргументов => [infer _] нам необходим, но на него ругается линтер
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async send<T extends keyof ClientToServerEvents>(type: T, ...args: Parameters<ClientToServerEvents[T]> extends [...infer R, infer _] ? R : unknown[]) {
        try {
            const validateData = validateEmitEvent(type, args[0]);

            if (validateData) {
                const { success, message, timestamp } = await this._socket.timeout(SOCKET_ACK_TIMEOUT).emitWithAck(type, ...args);

                if (!success) {
                    throw i18next.t("core.socket.error.emit_event_on_the_server", { message, timestamp });
                }
    
                logger.debug(i18next.t("core.socket.emit_handled", { type, timestamp }));
            }
        } catch (error) {
            this.emit(MainClientEvents.ERROR, i18next.t("core.socket.error.emit", { type, message: error }));
        }
    }

    disconnect() {
        logger.debug("disconnect");
        this._socket.disconnect();
    }

    _connect() {
        logger.debug("_connect");

        this._socket.auth = { userId: this._myId };
        this._socket.connect();
    }

    private _bindSocketControllerListeners() {
        this._socketController.on(MainClientEvents.REDIRECT, (path: string) => {
            logger.debug(`MainClientEvents.REDIRECT [path=${path}]`);
            this.emit(MainClientEvents.REDIRECT, path);
        });

        this._socketController.on(MainClientEvents.ERROR, (message: string) => {
            logger.debug("MainClientEvents.ERROR");
            this.emit(MainClientEvents.ERROR, message);
        });

        this._socketController.on(SocketEvents.RECONNECT, () => {
            logger.debug("SocketEvents.RECONNECT");
            this._connect();
        });

        this._socketController.on(MainClientEvents.LOG_OUT, () => {
            logger.debug("MainClientEvents.LOG_OUT");
            this.emit(MainClientEvents.LOG_OUT);
        });
    }
}
