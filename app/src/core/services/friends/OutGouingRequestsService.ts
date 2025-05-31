import { ApiRoutes } from "common-types";

import { type BaseFriends } from "@core/models/BaseFriends";
import type Request from "@core/Request";
import BaseFriendsService from "@core/services/friends/BaseFriendsService";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import { type IUser } from "@custom-types/models.types";
import { getFriendEntity } from "@utils/friends";

type GetAllGeneric = { outgoingRequests: IUser[]; count: number; hasMore: boolean; };

// Сервис для управления исходящими запросами на добавление в друзья
export default class OutgoingRequestsService extends BaseFriendsService implements BaseFriends {
	constructor(protected readonly _request: Request) {
		super(_request);
	}

	private get _params() {
		return {
			route: ApiRoutes.getOutgoingRequests,
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingOutgoingRequests(isLoading);
			},
			successCb: (data: GetAllGeneric) => {
				const newFriends = data.outgoingRequests
					.map(getFriendEntity)
					.filter(friend =>
						!this.items.some(existing => existing.id === friend.id),
					);
				this.items.push(...newFriends);

				this.syncStore();
			},
		};
	}

	// Получение всех исходящих запросов на добавление в друзья
	override getAll() {
		if (!this.hasMore || this.items.length) {
			this.syncStore();
			return;
		}

		super.getAll<GetAllGeneric>(this._params);
	}

	// Получение еще исходящих запросов в компоненте виртуального скролла
	override loadMore(resolve: () => void) {
		super.loadMore(resolve);

		this.getMoreByDebounce<GetAllGeneric>(this._params);
	}

	// Поиск по записям в текущей вкладке
	override search(value: string) {
		super.search(value);

		useFriendsStore.getState().setSearchOutgoingRequests(this.searchValue);

		this.getByDebounce<GetAllGeneric>(this._params);
	}

	// Отменить запрос на дружбу (отмена отправленного запроса на дружбу)
	unfollow(friendId: string, updateSearchFriends: (friend: IFriend) => void) {
		this._request.post({
			route: ApiRoutes.unfollow,
			data: { friendId },
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingUnfollowAction(isLoading);
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
		useFriendsStore.getState().setOutgoingRequests({
			items: [ ...this.items ],
			hasMore: this.hasMore,
			count: this.count,
		});
	}
};