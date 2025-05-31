import { type BaseFriends, type IGetAll } from "@core/models/BaseFriends";
import type Request from "@core/Request";
import { type IFriend } from "@custom-types/friends.types";
import { FRIENDS_DEBOUNCE_TIMEOUT, FRIENDS_LIMIT } from "@utils/constants";
import debounce from "@utils/debounce";

// Базовый абстрактный класс для всех сервисов управления друзьями
export default abstract class BaseFriendsService implements BaseFriends {
	protected items: IFriend[] = [];
	protected hasMore: boolean = true;
	protected count: number = 0;
	protected searchValue: string = "";

	private readonly _debouncedMoreFetch: Function;
	private readonly _debouncedSearchFetch: Function;

	private _done?: () => void = undefined;

	protected constructor(protected readonly _request: Request, protected readonly _userId?: string) {
		this._debouncedMoreFetch = debounce(BaseFriendsService.prototype.getAll.bind(this), FRIENDS_DEBOUNCE_TIMEOUT.LOAD_MORE);
		this._debouncedSearchFetch = debounce(BaseFriendsService.prototype.getAll.bind(this), FRIENDS_DEBOUNCE_TIMEOUT.SEARCH);
	}

	// Установка количества общих элементов
	setCount(count: number) {
		this.count = count;
	}

	// Получение всех пользователей (page только для "Возможных друзей", так как только в этом случае нет времени сортировки)
	protected getAll<T>({ route, page, data, setLoading, successCb }: IGetAll<T>) {
		const lastItem = this.items[this.items.length - 1];

		// Получаем последний id подгруженного друга, чтобы запросить следующих друзей (кроме только что добавленных)
		const lastCreatedAt = lastItem?.newest ? undefined : lastItem?.createdAt;

		this._request.post({
			route,
			data: { ...data, userId: this._userId, limit: FRIENDS_LIMIT, lastCreatedAt, search: this.searchValue, page },
			setLoading,
			successCb: data => {
				this.count = data.count;
				this.hasMore = data.hasMore;

				successCb(data);

				this._done?.();
			},
		});
	}

	// Получить еще записи раздела с флагом окончания запроса (для корректной работы виртуального списка)
	protected loadMore(resolve: () => void) {
		this._done = resolve;
	}

	// Поиск по записям в текущей вкладке
	protected search(value: string) {
		// Необходимо обновить список записей текущей вкладки, если введенная строка поиска не совпадает с сохраненной ранее (то есть, обновляется)
		if (value !== this.searchValue) {
			this.items = [];
		}

		this.searchValue = value;
	}

	// Вызываем метод получения записей с задержкой в 100 мс для загрузки еще
	protected getMoreByDebounce<T>(params: IGetAll<T>) {
		this._debouncedMoreFetch(params);
	}

	// Вызываем метод получения записей с задержкой в 300 мс для поиска
	protected getByDebounce<T>(params: IGetAll<T>) {
		this._debouncedSearchFetch(params);
	}

	// Добавление пользователя в список
	add(user: IFriend) {
		if (!this.find(user.id)) {
			this.items.unshift({ ...user, newest: true });
			this.count += 1;
		}
	}

	// Удаление пользователя из списка
	remove(userId: string) {
		this.items = this.items.filter(u => u.id !== userId);
		this.count = this.count
			? this.count - 1
			: 0;
	}

	// Поиск пользователя в списке
	find(userId: string) {
		return this.items.find(u => u.id === userId);
	}
};