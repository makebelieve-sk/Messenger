import { ApiRoutes } from "common-types";

import { type BaseFriends } from "@core/models/BaseFriends";
import type Request from "@core/Request";
import BaseFriendsService from "@core/services/friends/BaseFriendsService";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import { type IUser } from "@custom-types/models.types";
import { getFriendEntity } from "@utils/friends";

type GetAllGeneric = { incomingRequests: IUser[]; count: number; hasMore: boolean; };

// Сервис для управления входящими запросами дружбы
export default class IncomingRequestsService extends BaseFriendsService implements BaseFriends {
	constructor(protected readonly _request: Request) {
		super(_request);
	}

	private get _params() {
		return {
			route: ApiRoutes.getIncomingRequests,
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingIncomingRequests(isLoading);
			},
			successCb: (data: GetAllGeneric) => {
				const newFriends = data.incomingRequests
					.map(getFriendEntity)
					.filter(friend =>
						!this.items.some(existing => existing.id === friend.id),
					);
				this.items.push(...newFriends);

				this.syncStore();
			},
		};
	}

	// Получение всех входящих запросов дружбы
	override getAll() {
		if (!this.hasMore || this.items.length) {
			this.syncStore();
			return;
		}

		super.getAll<GetAllGeneric>(this._params);
	}

	// Получение еще входящих запросов в компоненте виртуального скролла
	override loadMore(resolve: () => void) {
		super.loadMore(resolve);

		this.getMoreByDebounce<GetAllGeneric>(this._params);
	}

	// Поиск по записям в текущей вкладке
	override search(value: string) {
		super.search(value);

		useFriendsStore.getState().setSearchIncomingRequests(this.searchValue);

		this.getByDebounce<GetAllGeneric>(this._params);
	}

	// Принять запрос дружбы (добавить в друзья)
	accept(friendId: string, updateFriends: (friend: IFriend) => void) {
		this._request.post({
			route: ApiRoutes.acceptFriendRequest,
			data: { friendId },
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingAcceptAction(isLoading);
			},
			successCb: () => {
				const friendToRemove = this.find(friendId);

				if (friendToRemove) {
					this.remove(friendId);

					// Обновление списка друзей
					updateFriends(friendToRemove);

					useFriendsStore.getState().removeFriendsNotification();
					this.syncStore();
				}
			},
		});
	}

	// Отклонить запрос на дружбу (оставить в подписчиках)
	leftInFollowers(friendId: string, updateFollowers: (friend: IFriend) => void) {
		this._request.post({
			route: ApiRoutes.leftInFollowers,
			data: { friendId },
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingLeftInFollowersAction(isLoading);
			},
			successCb: () => {
				const friendToRemove = this.find(friendId);

				if (friendToRemove) {
					this.remove(friendId);

					// Обновление списка подписчиков
					updateFollowers(friendToRemove);

					useFriendsStore.getState().removeFriendsNotification();
					this.syncStore();
				}
			},
		});
	}

	syncStore() {
		useFriendsStore.getState().setIncomingRequests({
			items: [ ...this.items ],
			hasMore: this.hasMore,
			count: this.count,
		});
	}
};