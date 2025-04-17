import EventEmitter from "events";
import { type RequestHandler } from "express";
import { type IncomingMessage } from "http";
import { Server } from "socket.io";

import socketIoConfig from "@config/socket.io.config";
import UsersController from "@core/controllers/UsersController";
import Database from "@core/database/Database";
import RedisWorks from "@core/Redis";
import SocketController from "@core/socket/SocketController";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { SocketError } from "@errors/index";
import { RedisKeys } from "@custom-types/enums";
import { type ServerType } from "@custom-types/index";
import { type SocketType } from "@custom-types/socket.types";

const logger = Logger("Socket");
const COOKIE_HEADER_NAME = "Set-Cookie";

// Класс, отвечает за установку сокет соединения с клиентом по транспорту "websocket"
export default class SocketWorks extends EventEmitter {
	private _io!: SocketType;

	constructor(
		private readonly _server: ServerType,
		private readonly _users: UsersController,
		private readonly _database: Database,
		private readonly _redisWork: RedisWorks,
		private readonly _expressSession: RequestHandler,
	) {
		super();

		this._init();
	}

	get io() {
		return this._io;
	}

	private _init() {
		logger.debug("init");

		this._io = new Server(this._server, socketIoConfig);

		this._useMiddlewares();
		this._onConnection();
		this._useEngineHandlers();
	}

	private _useMiddlewares() {
		// Милдвар сокета - добавление сессии express-session в соединение socket.io
		this._io.engine.use(this._expressSession);

		// Мидлвар сокета - проверка сессии запроса сокет-соединения в Redis
		this._io.use(async (socket, next) => {
			const isRedisSessionExists = await this._checkRedisSession(socket.request.sessionID);

			if (!isRedisSessionExists) {
				return next(new SocketError(t("socket.error.sessions_not_match_or_exists")));
			}

			logger.info(t("socket.session_done"));
			next();
		});

		// Милдвар сокета - проверка пользователя в сокете
		this._io.use((socket, next) => {
			const userId: string | undefined = socket.handshake.auth.userId;

			if (!userId) {
				return next(new SocketError(t("socket.error.user_id_not_found")));
			}

			const findUser = this._users.get(userId);

			if (!findUser) {
				return next(new SocketError(t("socket.error.user_not_found")));
			}

			socket.user = findUser;
			next();
		});
	}

	private _onConnection() {
		this._io.on("connection", socket => {
			new SocketController(this._users, this._database, socket, this._io);
		});
	}

	private _useEngineHandlers() {
		logger.debug("_useEngineHandlers");

		/**
		 * Проверка первичного handshake запроса перед установкой сокет-соединения
		 * Проверка происходит в 3 этапа:
		 *   - проверка сессии в заголовках запроса
		 *   - проверка сессии в объекте запроса
		 *   - проверка сессии в Redis хранилище (RedisStore)
		 */
		this._io.engine.on("initial_headers", async (headers: { [key: string]: string }, req: IncomingMessage) => {
			// Удостоверимся, что заголовки содержат заголовок с куки
			if (headers.hasOwnProperty(COOKIE_HEADER_NAME) && headers[COOKIE_HEADER_NAME][0]) {
				const sessionHeader = headers[COOKIE_HEADER_NAME][0];

				// Удостоверимся, что куки с id сессии в заголовках совпадает с id сессии в объекте запроса
				if (sessionHeader.includes(req.sessionID)) {
					const isRedisSessionExists = await this._checkRedisSession(req.sessionID);

					if (isRedisSessionExists) {
						logger.info(t("socket.handshake_connection_successful"));
						return;
					}
				}
			}

			new SocketError(
				t("socket.error.sessions_not_match_or_exists", {
					sessionId: req.sessionID,
				}),
			);
		});

		// Не нормальное отключение io
		this._io.engine.on("connection_error", (error: { code: number; message: string; context: { name: string; }; }) => {
			const { code, message, context } = error;
			new SocketError(
				t("socket.error.engine_socket", {
					code: code.toString(),
					message,
					context: context.name,
				}),
			);
		});
	}

	// Проверка сессии в RedisStore
	private async _checkRedisSession(sessionId: string) {
		return Boolean(await this._redisWork.get(RedisKeys.SESS, sessionId));
	}

	close() {
		logger.debug("close");

		// Берем все сокеты главного неймспейса и возвращаем их
		const sockets = Array.from(this._io.sockets.sockets.values());

		for (let i = 0; i < sockets.length; i++) {
			const socket = sockets[i];

			// Получаем список всех событий для каждого сокета
			const socketEvents = socket.eventNames();

			for (let j = 0; j < socketEvents.length; j++) {
				// Удаляем все слушатели каждого события сокета для предотвращения утечки памяти
				socket.removeAllListeners(socketEvents[j]);
			}
		}

		this._io.close();
	}
}
