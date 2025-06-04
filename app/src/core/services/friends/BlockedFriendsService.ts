import { ApiRoutes } from "common-types";

import { type BaseFriends } from "@core/models/BaseFriends";
import type Request from "@core/Request";
import BaseFriendsService from "@core/services/friends/BaseFriendsService";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import { type IUser } from "@custom-types/models.types";
import { getFriendEntity } from "@utils/friends";

type GetAllGeneric = { blockedFriends: IUser[]; count: number; hasMore: boolean; };

// Сервис для управления заблокированными пользователями
export default class BlockedFriendsService extends BaseFriendsService implements BaseFriends {
	constructor(protected readonly _request: Request) {
		super(_request);
	}

	private get _params() {
		return {
			route: ApiRoutes.getBlockedFriends,
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingBlockFriends(isLoading);
			},
			successCb: (data: GetAllGeneric) => {
				const newFriends = data.blockedFriends
					.map(getFriendEntity)
					.filter(friend =>
						!this.items.some(existing => existing.id === friend.id),
					);
				this.items.push(...newFriends);

				this.syncStore();
			},
		};
	}

	// Получение списка заблокированных пользователей
	override getAll() {
		if (!this.hasMore || this.items.length) {
			this.syncStore();
			return;
		}

		super.getAll<GetAllGeneric>(this._params);
	}

	// Получение еще заблокированных пользователей в компоненте виртуального скролла
	override loadMore(resolve: () => void) {
		super.loadMore(resolve);

		this.getMoreByDebounce<GetAllGeneric>(this._params);
	}

	// Поиск по записям в текущей вкладке
	override search(value: string) {
		super.search(value);

		useFriendsStore.getState().setSearchBlockedFriends(this.searchValue);

		this.getByDebounce<GetAllGeneric>(this._params);
	}

	// Разблокировка друга
	unblock(friendId: string, updateSearchFriends: (friend: IFriend) => void) {
		this._request.post({
			route: ApiRoutes.unblockFriend,
			data: { friendId },
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingUnblockAction(isLoading);
			},
			successCb: () => {
				const friendToRemove = this.find(friendId);

				if (friendToRemove) {
					this.remove(friendId);

					// Обновление списка возможных друзей + вкладки "Поиск"
					updateSearchFriends(friendToRemove);

					this.syncStore();
				}
			},
		});
	}

	syncStore() {
		useFriendsStore.getState().setBlockedFriends({
			items: [ ...this.items ],
			hasMore: this.hasMore,
			count: this.count,
		});
	}
};