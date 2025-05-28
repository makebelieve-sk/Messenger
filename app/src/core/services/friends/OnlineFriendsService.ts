import { type BaseFriends } from "@core/models/BaseFriends";
import type Request from "@core/Request";
import BaseFriendsService from "@core/services/friends/BaseFriendsService";
import { type IUser } from "@custom-types/models.types";
import useFriendsStore from "@store/friends";
import { FRIENDS_DEBOUNCE_TIMEOUT } from "@utils/constants";
import debounce from "@utils/debounce";
import { getFriendEntity } from "@utils/friends";
import { ApiRoutes } from "common-types";

type GetAllGeneric = { onlineFriends: IUser[]; count: number; hasMore: boolean; };

// Сервис для управления онлайн-друзьями
export default class OnlineFriendsService extends BaseFriendsService implements BaseFriends {
	private _userIds: string[] = [];
	private _debouncedSearch: Function;

	constructor(protected readonly _request: Request, protected readonly _userId: string) {
		super(_request, _userId);

		this._debouncedSearch = debounce(OnlineFriendsService.prototype._prepareSearch.bind(this), FRIENDS_DEBOUNCE_TIMEOUT.SEARCH);
	}

	private get _params() {
		return {
			route: ApiRoutes.checkOnlineUser,
				data: { ids: this._userIds },
				setLoading: (isLoading: boolean) => {
					useFriendsStore.getState().setIsLoadingOnlineFriends(isLoading);
				},
				successCb: (data: GetAllGeneric) => {
					const newFriends = data.onlineFriends
						.map(getFriendEntity)
						.filter(friend =>
							!this.items.some(existing => existing.id === friend.id),
						);
					this.items.push(...newFriends);

					this.syncStore();
				}
		};
	}

	checkUsers(users: IUser[]) {
		if (users && users.length) {
			this._userIds = users.map(user => user.id);
			super.getAll<GetAllGeneric>(this._params);
		} else {
			this._userIds = [];
		}
	}

	removeUser(userId: string) {
		this.remove(userId);
		this.syncStore();
	}

	// Получение всех онлайн друзей целиком у текущего пользователя
	override getAll() {
		this.syncStore();
	}

	// Получение еще друзей в компоненте виртуального скролла
	override loadMore(resolve: () => void) {
		this.syncStore();
		resolve();
	}

	// Поиск по записям в текущей вкладке
	override search(value: string) {
		super.search(value);

		useFriendsStore.getState().setSearchMyFriends(this.searchValue);

		this._debouncedSearch();
	}

	// Моментальная обработка поиска
	private _prepareSearch() {
		const filteredItems = this.items.filter(item => {
			return item.fullName.toLowerCase().includes(this.searchValue.toLowerCase());
		});

		useFriendsStore.getState().setOnlineFriends({
			items: [...filteredItems],
			hasMore: this.hasMore,
			count: this.count,
		});
	}

	syncStore() {
		useFriendsStore.getState().setOnlineFriends({
			items: [...this.items],
			hasMore: this.hasMore,
			count: this.count,
		});
	}
};