import { ApiRoutes } from "common-types";

import { type BaseFriends } from "@core/models/BaseFriends";
import type Request from "@core/Request";
import BaseFriendsService from "@core/services/friends/BaseFriendsService";
import useFriendsStore from "@store/friends";
import { type IUser } from "@custom-types/models.types";
import { getFriendEntity } from "@utils/friends";

type GetAllGeneric = { commonFriends: IUser[]; count: number; hasMore: boolean; };

// Сервис для управления общими друзьями с чужим профилем
export default class CommonFriendsService extends BaseFriendsService implements BaseFriends {
	constructor(protected readonly _request: Request, protected readonly _userId: string) {
		super(_request, _userId);
	}

	private get _params() {
		return {
			route: ApiRoutes.getCommonFriends,
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingCommonFriends(isLoading);
			},
			successCb: (data: GetAllGeneric) => {
				const newFriends = data.commonFriends
					.map(getFriendEntity)
					.filter(friend =>
						!this.items.some(existing => existing.id === friend.id),
					);
				this.items.push(...newFriends);

				this.syncStore();
			},
		};
	}

	// Получение общего списка друзей
	override getAll() {
		if (!this.hasMore || this.items.length) {
			this.syncStore();
			return;
		}

		super.getAll<GetAllGeneric>(this._params);
	}

	// Получение еще общих друзей в компоненте виртуального скролла
	override loadMore(resolve: () => void) {
		super.loadMore(resolve);

		this.getMoreByDebounce<GetAllGeneric>(this._params);
	}

	// Поиск по записям в текущей вкладке
	override search(value: string) {
		super.search(value);

		useFriendsStore.getState().setSearchCommonFriends(this.searchValue);

		this.getByDebounce<GetAllGeneric>(this._params);
	}

	syncStore() {
		useFriendsStore.getState().setCommonFriends({
			items: [ ...this.items ],
			hasMore: this.hasMore,
			count: this.count,
		});
	}
};