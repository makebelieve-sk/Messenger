import { SocketActions } from "common-types";

import type ProfilesController from "@core/controllers/ProfilesController";
import FriendsController from "@core/socket/controllers/Friends";
import MessangesController from "@core/socket/controllers/Messages";
import UsersController from "@core/socket/controllers/Users";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useUIStore from "@store/ui";
import { type SocketType } from "@custom-types/socket.types";
import { SOCKET_MIDDLEWARE_ERROR } from "@utils/constants";

const logger = Logger.init("SocketController");
const SERVER_DISCONNECT = "io server disconnect";

// Главный контроллер по управлению всеми событиями сокет соединения, при этом, обрабатывая системные события
export default class SocketController {
	constructor(
		private readonly _socket: SocketType,
		private readonly _myId: string,
		private readonly _profilesController: ProfilesController,
	) {
		this._init();
		this._socketManagerListeners();

		new UsersController(this._socket, this._myId, this._profilesController);
		new FriendsController(this._socket, this._profilesController);
		new MessangesController(this._socket);
	}

	private _init() {
		this._socket.on("connect", () => {
			this._socket.recovered
				? logger.info(i18next.t("core.socket.connection_successfully_recovered", { socketId: this._socket.id }))
				: logger.info(i18next.t("core.socket.connection_established", { socketId: this._socket.id }));
		});

		// Обработка системного канала с ошибками
		this._socket.on(SocketActions.SOCKET_CHANNEL_ERROR, ({ message }, callback) => {
			// Вывод системной ошибки в SnackbarComponent
			useUIStore.getState().setSnackbarError(message);

			callback({ success: true, timestamp: Date.now() });
		});

		// Событие возникает при невозможности установить соединение или соединение было отклонено сервером (к примеру мидлваром)
		this._socket.on("connect_error", (error) => {
			const isSocketActive = this._socket.active;

			logger.error(i18next.t("core.socket.error.connect_error", { isSocketActive, message: error.message }));

			// Означает, что соединение было отклонено сервером и не равно авторизационной ошибке мидлвара сервера
			if (!isSocketActive && error.message !== SOCKET_MIDDLEWARE_ERROR) {
				this._manualReconnect();
				return;
			}

			// Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
		});

		this._socket.on("disconnect", (reason) => {
			const isSocketActive = this._socket.active;

			logger.debug(`disconnect [isSocketActive=${isSocketActive}, reason=${reason}]`);

			// Если сокет отключился по инициативе сервера, то перезапускаем сокет
			if (!isSocketActive && reason === SERVER_DISCONNECT) {
				this._manualReconnect();
			}

			// Иначе сокет попытается переподключиться автоматически (временный разрыв соединения)
		});
	}

	// Обработка системных событий у Manager socket.io-client
	private _socketManagerListeners() {
		this._socket.io.on("error", (error) => {
			useUIStore
				.getState()
				.setError(i18next.t("core.socket.error.connect_error", { isSocketActive: this._socket.active, message: error.message }));
		});

		this._socket.io.on("ping", () => {
			logger.debug("pong sent to server");
		});

		this._socket.io.on("reconnect", (attempt) => {
			logger.info(`successfully reconnected after ${attempt} attempts`);
		});

		this._socket.io.on("reconnect_attempt", (attempt) => {
			logger.info(`reconnecting attempts number: ${attempt}...`);
		});

		this._socket.io.on("reconnect_error", (error) => {
			logger.info(`reconnecting failed with error: ${error}`);
		});

		this._socket.io.on("reconnect_failed", () => {
			useUIStore.getState().setError(i18next.t("core.socket.error.reconnect_failed"));
		});
	}

	// Ручной реконнект к сокет-серверу
	private _manualReconnect() {
		logger.debug("_manualReconnect");

		this._socket.auth = { userId: this._myId };
		this._socket.connect();
	}
};