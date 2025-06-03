"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Класс контроллер, управляет поведением пользователей на сервере (онлайн пользователи)
class UsersController {
    constructor() {
        this._users = new Map();
    }
    get size() {
        return this._users.size;
    }
    has(userId) {
        return this._users.has(userId);
    }
    get(userId) {
        return this._users.get(userId);
    }
    getValues() {
        return Array.from(this._users.values());
    }
    add(user) {
        return this._users.set(user.id, {
            ...user,
            sockets: new Map(),
        });
    }
    update(userId, newUser) {
        this._users.set(userId, newUser);
    }
    delete(userId) {
        this._users.delete(userId);
    }
}
exports.default = UsersController;
//# sourceMappingURL=UsersController.js.map