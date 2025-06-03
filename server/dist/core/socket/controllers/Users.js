"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const events_1 = __importDefault(require("events"));
const logger_1 = __importDefault(require("@service/logger"));
const events_2 = require("@custom-types/events");
const logger = (0, logger_1.default)("Socket:UsersController");
// Контроллер по управлению сокет событиями пользователя
class UsersController extends events_1.default {
    constructor(_socket, _users) {
        super();
        this._socket = _socket;
        this._users = _users;
        // Задержка необходима для того, чтобы отправка уведомления через emit произошла перед началом следующей фазы event loop
        Promise.resolve().then(() => this._init());
    }
    get _otherUsers() {
        return this._users.getValues().filter(user => user.id !== this._socket.user.id);
    }
    get _allUsers() {
        // Преобразовываем список пользователей, при этом, не отправляя поле sockets на клиент
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return this._users.getValues().map(({ sockets, ...rest }) => rest);
    }
    _init() {
        logger.debug("_init");
        // Отправляем всем пользователям обновленный список активных пользователей
        this.emit(events_2.SocketEvents.SEND, common_types_1.SocketActions.GET_ALL_USERS, {
            users: this._allUsers,
        });
        /**
         * Оповещаем все сокеты (кроме себя) о новом пользователе только в том случае,
         * если есть другие пользователи и количество сокет-соединений текущего пользователя одно.
         */
        if (this._otherUsers.length && this._socket.user.sockets.size === 1) {
            this.emit(events_2.SocketEvents.SEND_BROADCAST, common_types_1.SocketActions.GET_NEW_USER, {
                user: this._socket.user,
            });
        }
    }
}
exports.default = UsersController;
//# sourceMappingURL=Users.js.map