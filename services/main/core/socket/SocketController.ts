import { HandleArgsType, SocketActions } from "common-types";
import EventEmitter from "events";
import type { Server, Socket } from "socket.io";

import type MainUsersController from "@core/controllers/UsersController";
import type Database from "@core/database/Database";
import MessagesController from "@core/socket/controllers/Messages";
import UsersController from "@core/socket/controllers/Users";
import { validateEmitEvent } from "@core/socket/validation";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { SocketError } from "@errors/index";
import { SocketEvents } from "@custom-types/events";
import type { IAck, ServerToClientEvents, SocketType, SocketWithUser } from "@custom-types/socket.types";
import { SOCKET_ACK_TIMEOUT } from "@utils/constants";

const logger = Logger("SocketController");

type SocketEventHandler = <T extends keyof ServerToClientEvents>(
	type: T,
	data: HandleArgsType<ServerToClientEvents[T]>
) => Promise<void>;
type SocketToEventHandler = <T extends keyof ServerToClientEvents>(
	type: T,
	data: HandleArgsType<ServerToClientEvents[T]>,
	socketTo?: string
) => Promise<void>;

// Класс, отвечает за работу текущего сокет-соединения
export default class SocketController extends EventEmitter {
	private _usersController!: UsersController;
	private _messagesController!: MessagesController;

	private readonly _userId: string;

	constructor(
		private readonly _users: MainUsersController,
		private readonly _database: Database,
		private readonly _socket: SocketWithUser,
		private readonly _io: SocketType,
	) {
		super();

		this._userId = this._socket.user.id;

		this._addNewSocket();
		this._init();
	}

	// Добавляем/Обновляем список пользователей. Добавляем/Обновляем список сокет-соединений у этого пользователя
	private _addNewSocket() {
		this._users.update(this._userId, {
			...this._socket.user,
			sockets: this._socket.user.sockets.set(this._socket.id, this),
		});

		// Каждое новое сокет-соединение у каждого пользователя подключается к общей комнате (id пользователя)
		this._socket.join(this._userId);
	}

	private async _init() {
		logger.info("Session example [session=%j]", this._socket.request.session);
		logger.debug("_init [socketId=%s, userId=%s]", this._socket.id, this._userId);

		try {
			/**
			 * Обновляем дату последнего захода пользователя только при первом сокет-соединении.
			 * Все остальные соединения у данного пользователя игнорируются.
			 */
			if (this._socket.user.sockets.size === 1) {
				await this._database.repo.userDetails.updateLastSeen(this._userId);
			}
		} catch (error) {
			this._handleError((error as Error).message);
		}

		this._usersController = new UsersController(this._socket, this._users);
		this._messagesController = new MessagesController(this._socket);

		this._bindListeners();

		// Событие отключения (выполняется немного ранее, чем disconnect) - можно получить доступ к комнатам
		this._socket.on("disconnecting", reason => {
			logger.info(t("socket.disconnecting", { reason }));
		});

		// Отключение сокета
		this._socket.on("disconnect", async reason => {
			try {
				logger.info(
					t("socket.socket_disconnected_with_reason", {
						socketId: this._socket.id,
						reason,
					}),
				);

				/**
				 * Добавляем проверку на тот случай, если клиент разорвал соединение (например, закрыл вкладку/браузер)
				 * Иначе через кнопку выхода пользователь уже удаляется из списка
				 */
				const disconnectingUser = this._getUser(this._userId);

				if (!disconnectingUser) {
					throw t("socket.error.user_not_found");
				}

				// Удаляем текущие сокет-соединение у пользователя
				disconnectingUser.sockets.delete(this._socket.id);
				// Отключаемся из комнаты пользователя
				this._socket.leave(this._userId);

				// Если у текущего клиента нет других сокет-соединений (других открытых вкладок браузера)
				if (!disconnectingUser.sockets.size) {
					this._users.delete(this._userId);

					// Если в системе остались другие пользователи
					if (this._users.size) {
						// Оповещаем все сокеты (кроме себя) об отключении пользователя
						this._sendBroadcast(SocketActions.USER_DISCONNECT, {
							userId: this._userId,
						});
					}

					// Обновляем дату моего последнего захода
					await this._database.repo.userDetails.updateLastSeen(this._userId, new Date().toUTCString());
				}
			} catch (error) {
				this._sendError(t("socket.error.disconnect", { message: (error as Error).message }));
			}
		});
	}

	private _getUser(userId: string) {
		return this._users.get(userId);
	}

	// Обработка ошибки без возврата ее на клиент
	private _handleError(message: string) {
		return new SocketError(message);
	}

	// Метод отправки ошибки на клиент (создание ошибки на сервере и вывод в логи)
	private _sendError(message: string) {
		const nextError = this._handleError(message);

		if (this._socket && this._socket.id) {
			this.sendTo(SocketActions.SOCKET_CHANNEL_ERROR, {
				message: nextError.message,
			});
		}
	}

	private _bindListeners() {
		this._usersController.on(SocketEvents.SEND, ((type, ...data) => {
			this._send(type, ...data);
		}) as SocketEventHandler);

		this._usersController.on(SocketEvents.SEND_BROADCAST, ((type, ...data) => {
			this._sendBroadcast(type, ...data);
		}) as SocketEventHandler);

		this._messagesController.on(
			SocketEvents.NOTIFY_FEW_ANOTHER_USERS,
			<T extends keyof ServerToClientEvents>(
				users: { id: string }[],
				type: T,
				data: HandleArgsType<ServerToClientEvents[T]>,
			) => {
				for (const user of users) {
					const findUser = this._getUser(user.id);

					if (findUser && user.id !== this._socket.user.id) {
						this.sendTo(type, data, findUser.id);
					}
				}
			},
		);
	}

	// Обработка ack при отправке события от одного клиента
	private _handleEmit(response: IAck, type: keyof ServerToClientEvents) {
		const { success, message, timestamp } = response;

		success
			? logger.debug(
				t("socket.emit_handled", {
					type,
					timestamp: (timestamp as number).toString(),
				}),
			)
			: this._handleError(
				t("socket.error.handle_event_on_client", {
					type,
					message: message as string,
				}),
			);

		return success;
	}

	// Обработка ack при отправке события от нескольких клиентов
	private _handleEmits(response: IAck[], type: keyof ServerToClientEvents) {
		/**
		 * Добавляем обработку случая, если событие было отправлено, но клиент отключился и ack не успевает вернуться.
		 * Например, при выходе.
		 */
		if ((!response || !response.length) && this._socket.connected) {
			this._handleError(t("socket.error.emit_broadcast_empty_response"));
			return;
		}

		if (!this._socket.connected) {
			return;
		}

		for (let i = 0; i < response.length; i++) {
			const isSuccess = this._handleEmit(response[i], type);

			if (!isSuccess) {
				break;
			}

			logger.debug(
				t("socket.emit_handled", {
					type,
					timestamp: (response[i].timestamp as number).toString(),
				}),
			);
		}
	}

	/**
	 * Основной метод отправки события с сервера текущему конкретному клиенту с добавлением ack.
	 * Ack - подтверждение обработки клиентом данного события.
	 * Здесь идет отправка только одному сокет-соединению клиента (то есть одной конкретной вкладке) - поэтому он приватный.
	 */
	private _send: SocketEventHandler = async (type, data) => {
		try {
			const validateData = validateEmitEvent(this._sendError.bind(this), type, data);

			if (validateData) {
				const response = await (this._socket as Socket).timeout(SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);

				this._handleEmit(response, type);
			}
		} catch (error) {
			this._sendError(
				t("socket.error.emit_with_ack", {
					type,
					message: (error as Error).message,
				}),
			);
		}
	};

	/**
	 * Основной метод отправки события с сервера на все подключенные клиенты кроме текущего с добавлением ack.
	 * Здесь идет отправка всем сокет-соединениям других пользователей.
	 * Важно: Помним про то, что необходимо исключить все "мои" сокет-соединения (другие вкладки), для этого используем except.
	 */
	private _sendBroadcast: SocketEventHandler = async (type, data) => {
		try {
			const validateData = validateEmitEvent(this._sendError.bind(this), type, data);

			if (validateData) {
				const response = await (this._socket as Socket).broadcast.except(this._userId).timeout(SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);

				this._handleEmits(response, type);
			}
		} catch (error) {
			this._sendError(t("socket.error.emit_broadcast_with_ack", { type, message: (error as Error).message }));
		}
	};

	/**
	 * Основной метод отправки события с сервера конкретному клиенту с добавлением ack.
	 * Здесь идет отправка всем сокет-соединениям одного пользователя (то есть всем открытым вкладкам).
	 * Когда имеется в виду отправить событие другому пользователю, то необходимо использовать данный метод - поэтому он публичный.
	 */
	sendTo: SocketToEventHandler = async (type, data, socketTo = this._userId) => {
		try {
			const validateData = validateEmitEvent(this._sendError.bind(this), type, data);

			if (validateData) {
				const response = await (this._io as Server).to(socketTo).timeout(SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);

				this._handleEmits(response, type);
			}
		} catch (error) {
			this._sendError(t("socket.error.emit_to_with_ack", { type, message: (error as Error).message }));
		}
	};

	/**
	 * Основной метод отправки события с сервера конкретному клиенту с добавлением ack кроме инициатора.
	 * Здесь идет отправка всем сокет-соединениям одного пользователя (то есть всем открытым вкладкам) кроме инициатора 
	 * (с фронта которого пришел запрос на сервер).
	 * Когда имеется в виду отправить событие другому пользователю кроме инициатора (его самого), 
	 * то необходимо использовать данный метод - поэтому он публичный.
	 */
	sendBroadcastTo: SocketToEventHandler = async (type, data, socketTo = this._userId) => {
		try {
			const validateData = validateEmitEvent(this._sendError.bind(this), type, data);

			if (validateData) {
				const response = await (this._io as Server).to(socketTo).except(this._socket.id).timeout(SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);

				this._handleEmits(response, type);
			}
		} catch (error) {
			this._sendError(t("socket.error.emit_to_with_ack", { type, message: (error as Error).message }));
		}
	};
}
