import { io } from "socket.io-client";

import type ProfilesController from "@core/controllers/ProfilesController";
import SocketController from "@core/socket/SocketController";
import { validateEmitEvent } from "@core/socket/validation";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useUIStore from "@store/ui";
import type { ClientToServerEvents, SocketType } from "@custom-types/socket.types";
import { SOCKET_ACK_TIMEOUT, SOCKET_RECONECTION_ATTEMPTS, SOCKET_RECONNECTION_DELAY, SOCKET_URL } from "@utils/constants";

const logger = Logger.init("Socket");

// Класс, являющийся оберткой для socket.io-client, позволяющий давать запросы на сервер по протоколу ws через транспорт websocket
export default class Socket {
	private _socket!: SocketType;
	private _myId!: string;

	constructor(private readonly _profilesController: ProfilesController) {}

	init(myId: string) {
		logger.debug(`init [userId=${myId}]`);

		this._myId = myId;

		if (!this._myId) {
			useUIStore.getState().setError(i18next.t("core.socket.error.user_not_exists"));
			return;
		}

		this._socket = io(SOCKET_URL, {
			// Виды транспортов (идут один за другим по приоритету, данный массив на сервере должен совпадать)
			transports: [ "websocket" ],
			// Автоматически подключаться при создании экземпляра клиента (без вызова connect())
			autoConnect: false,
			// Включаем автоматическое переподключения для учитывания попыток и задержки
			reconnection: true,
			// Количество попыток переподключения перед тем, как закрыть соединение
			reconnectionAttempts: SOCKET_RECONECTION_ATTEMPTS,
			// Задержка между попытками переподключения
			reconnectionDelay: SOCKET_RECONNECTION_DELAY,
			// Не создает новое соединение, если оно уже существует
			forceNew: false,
			// Позволяет улучшать соединение с polling до websocket (в нашем случае улучшается с первого http-запроса (handshake) до websocket)
			upgrade: true,
			// Позволяет сокет соединению автоматически закрываться при событии beforeunload (закрытие вкладки/браузера/обновление страницы)
			closeOnBeforeunload: true,
			// Включает передачу куки при кросс-доменных запросах (работает только с аналогичным параметром на сервере)
			withCredentials: true,
		});

		logger.debug("_connect");

		this._socket.auth = { userId: this._myId };
		this._socket.connect();

		new SocketController(this._socket, this._myId, this._profilesController);
	}

	/**
	 * Основной метод отправки события с клиента на сервер с добавлением ack
	 * (подтверждение обработки сервером данного события).
	 * Необходимо корректно указать тип аргументов => [infer _] нам необходим, но на него ругается линтер
	 */

	async send<T extends keyof ClientToServerEvents>(
		type: T, 
		...args: Parameters<ClientToServerEvents[T]> extends [...infer R, infer _] ? R : unknown[]
	) {
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
			useUIStore.getState().setError(i18next.t("core.socket.error.emit", { type, message: error }));
		}
	}

	disconnect() {
		logger.debug("disconnect");
		this._socket.disconnect();
	}
};