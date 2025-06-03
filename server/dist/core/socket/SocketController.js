"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const events_1 = __importDefault(require("events"));
const Messages_1 = __importDefault(require("@core/socket/controllers/Messages"));
const Users_1 = __importDefault(require("@core/socket/controllers/Users"));
const validation_1 = require("@core/socket/validation");
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const index_1 = require("@errors/index");
const events_2 = require("@custom-types/events");
const constants_1 = require("@utils/constants");
const logger = (0, logger_1.default)("SocketController");
// Класс, отвечает за работу текущего сокет-соединения
class SocketController extends events_1.default {
    constructor(_users, _database, _socket, _io) {
        super();
        this._users = _users;
        this._database = _database;
        this._socket = _socket;
        this._io = _io;
        /**
         * Основной метод отправки события с сервера текущему конкретному клиенту с добавлением ack.
         * Ack - подтверждение обработки клиентом данного события.
         * Здесь идет отправка только одному сокет-соединению клиента (то есть одной конкретной вкладке) - поэтому он приватный.
         */
        this._send = async (type, data) => {
            try {
                const validateData = (0, validation_1.validateEmitEvent)(this._sendError.bind(this), type, data);
                if (validateData) {
                    const response = await this._socket.timeout(constants_1.SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);
                    this._handleEmit(response, type);
                }
            }
            catch (error) {
                this._sendError((0, i18n_1.t)("socket.error.emit_with_ack", {
                    type,
                    message: error.message,
                }));
            }
        };
        /**
         * Основной метод отправки события с сервера на все подключенные клиенты кроме текущего с добавлением ack.
         * Здесь идет отправка всем сокет-соединениям других пользователей.
         * Важно: Помним про то, что необходимо исключить все "мои" сокет-соединения (другие вкладки), для этого используем except.
         */
        this._sendBroadcast = async (type, data) => {
            try {
                const validateData = (0, validation_1.validateEmitEvent)(this._sendError.bind(this), type, data);
                if (validateData) {
                    const response = await this._socket.broadcast.except(this._userId).timeout(constants_1.SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);
                    this._handleEmits(response, type);
                }
            }
            catch (error) {
                this._sendError((0, i18n_1.t)("socket.error.emit_broadcast_with_ack", { type, message: error.message }));
            }
        };
        /**
         * Основной метод отправки события с сервера конкретному клиенту с добавлением ack.
         * Здесь идет отправка всем сокет-соединениям одного пользователя (то есть всем открытым вкладкам).
         * Когда имеется в виду отправить событие другому пользователю, то необходимо использовать данный метод - поэтому он публичный.
         */
        this.sendTo = async (type, data, socketTo = this._userId) => {
            try {
                const validateData = (0, validation_1.validateEmitEvent)(this._sendError.bind(this), type, data);
                if (validateData) {
                    const response = await this._io.to(socketTo).timeout(constants_1.SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);
                    this._handleEmits(response, type);
                }
            }
            catch (error) {
                this._sendError((0, i18n_1.t)("socket.error.emit_to_with_ack", { type, message: error.message }));
            }
        };
        /**
         * Основной метод отправки события с сервера конкретному клиенту с добавлением ack кроме инициатора.
         * Здесь идет отправка всем сокет-соединениям одного пользователя (то есть всем открытым вкладкам) кроме инициатора
         * (с фронта которого пришел запрос на сервер).
         * Когда имеется в виду отправить событие другому пользователю кроме инициатора (его самого),
         * то необходимо использовать данный метод - поэтому он публичный.
         */
        this.sendBroadcastTo = async (type, data, socketTo = this._userId) => {
            try {
                const validateData = (0, validation_1.validateEmitEvent)(this._sendError.bind(this), type, data);
                if (validateData) {
                    const response = await this._io.to(socketTo).except(this._socket.id).timeout(constants_1.SOCKET_ACK_TIMEOUT).emitWithAck(type, validateData);
                    this._handleEmits(response, type);
                }
            }
            catch (error) {
                this._sendError((0, i18n_1.t)("socket.error.emit_to_with_ack", { type, message: error.message }));
            }
        };
        this._userId = this._socket.user.id;
        this._addNewSocket();
        this._init();
    }
    // Добавляем/Обновляем список пользователей. Добавляем/Обновляем список сокет-соединений у этого пользователя
    _addNewSocket() {
        this._users.update(this._userId, {
            ...this._socket.user,
            sockets: this._socket.user.sockets.set(this._socket.id, this),
        });
        // Каждое новое сокет-соединение у каждого пользователя подключается к общей комнате (id пользователя)
        this._socket.join(this._userId);
    }
    async _init() {
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
        }
        catch (error) {
            this._handleError(error.message);
        }
        this._usersController = new Users_1.default(this._socket, this._users);
        this._messagesController = new Messages_1.default(this._socket);
        this._bindListeners();
        // Событие отключения (выполняется немного ранее, чем disconnect) - можно получить доступ к комнатам
        this._socket.on("disconnecting", reason => {
            logger.info((0, i18n_1.t)("socket.disconnecting", { reason }));
        });
        // Отключение сокета
        this._socket.on("disconnect", async (reason) => {
            try {
                logger.info((0, i18n_1.t)("socket.socket_disconnected_with_reason", {
                    socketId: this._socket.id,
                    reason,
                }));
                /**
                 * Добавляем проверку на тот случай, если клиент разорвал соединение (например, закрыл вкладку/браузер)
                 * Иначе через кнопку выхода пользователь уже удаляется из списка
                 */
                const disconnectingUser = this._getUser(this._userId);
                if (!disconnectingUser) {
                    throw (0, i18n_1.t)("socket.error.user_not_found");
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
                        this._sendBroadcast(common_types_1.SocketActions.USER_DISCONNECT, {
                            userId: this._userId,
                        });
                    }
                    // Обновляем дату моего последнего захода
                    await this._database.repo.userDetails.updateLastSeen(this._userId, new Date().toUTCString());
                }
            }
            catch (error) {
                this._sendError((0, i18n_1.t)("socket.error.disconnect", { message: error.message }));
            }
        });
    }
    _getUser(userId) {
        return this._users.get(userId);
    }
    // Обработка ошибки без возврата ее на клиент
    _handleError(message) {
        return new index_1.SocketError(message);
    }
    // Метод отправки ошибки на клиент (создание ошибки на сервере и вывод в логи)
    _sendError(message) {
        const nextError = this._handleError(message);
        if (this._socket && this._socket.id) {
            this.sendTo(common_types_1.SocketActions.SOCKET_CHANNEL_ERROR, {
                message: nextError.message,
            });
        }
    }
    _bindListeners() {
        this._usersController.on(events_2.SocketEvents.SEND, ((type, ...data) => {
            this._send(type, ...data);
        }));
        this._usersController.on(events_2.SocketEvents.SEND_BROADCAST, ((type, ...data) => {
            this._sendBroadcast(type, ...data);
        }));
        this._messagesController.on(events_2.SocketEvents.NOTIFY_FEW_ANOTHER_USERS, (users, type, data) => {
            for (const user of users) {
                const findUser = this._getUser(user.id);
                if (findUser && user.id !== this._socket.user.id) {
                    this.sendTo(type, data, findUser.id);
                }
            }
        });
    }
    // Обработка ack при отправке события от одного клиента
    _handleEmit(response, type) {
        const { success, message, timestamp } = response;
        success
            ? logger.debug((0, i18n_1.t)("socket.emit_handled", {
                type,
                timestamp: timestamp.toString(),
            }))
            : this._handleError((0, i18n_1.t)("socket.error.handle_event_on_client", {
                type,
                message: message,
            }));
        return success;
    }
    // Обработка ack при отправке события от нескольких клиентов
    _handleEmits(response, type) {
        /**
         * Добавляем обработку случая, если событие было отправлено, но клиент отключился и ack не успевает вернуться.
         * Например, при выходе.
         */
        if ((!response || !response.length) && this._socket.connected) {
            this._handleError((0, i18n_1.t)("socket.error.emit_broadcast_empty_response"));
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
            logger.debug((0, i18n_1.t)("socket.emit_handled", {
                type,
                timestamp: response[i].timestamp.toString(),
            }));
        }
    }
}
exports.default = SocketController;
//# sourceMappingURL=SocketController.js.map