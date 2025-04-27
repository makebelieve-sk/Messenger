import { type UsersType } from "@custom-types/index";
import { type ISocketUser } from "@custom-types/socket.types";
import { type ISafeUser } from "@custom-types/user.types";

// Класс контроллер, управляет поведением пользователей на сервере (онлайн пользователи)
export default class UsersController {
	private _users: UsersType = new Map();

	constructor() {}

	get size() {
		return this._users.size;
	}

	has(userId: string) {
		return this._users.has(userId);
	}

	get(userId: string) {
		return this._users.get(userId);
	}

	getValues() {
		return Array.from(this._users.values());
	}

	add(user: ISafeUser) {
		return this._users.set(user.id, {
			...user,
			sockets: new Map(),
		});
	}

	update(userId: string, newUser: ISocketUser) {
		this._users.set(userId, newUser);
	}

	delete(userId: string) {
		this._users.delete(userId);
	}
}
