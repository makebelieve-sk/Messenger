import { ApiRoutes } from "common-types";

import { type BaseFriends } from "@core/models/BaseFriends";
import type Request from "@core/Request";
import BaseFriendsService from "@core/services/friends/BaseFriendsService";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import { type IUser } from "@custom-types/models.types";
import { getFriendEntity } from "@utils/friends";

type GetAllGeneric = { possibleFriends: IUser[]; count: number; hasMore: boolean; };

// Сервис для управления поиском возможных друзей
export default class SearchService extends BaseFriendsService implements BaseFriends {
	private _page = 0;

	constructor(protected readonly _request: Request) {
		super(_request);
	}

	private get _params() {
		return {
			route: ApiRoutes.getPossibleFriends,
			page: this._page,
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingPossibleFriends(isLoading);
			},
			successCb: (data: GetAllGeneric) => {
				const newFriends = data.possibleFriends
					.map(getFriendEntity)
					.filter(friend =>
						!this.items.some(existing => existing.id === friend.id),
					);
				this.items.push(...newFriends);

				this.syncStore();
			},
		};
	}

	// Запрос на получение возможных друзей текущего пользователя
	private _get() {
		super.getAll<GetAllGeneric>(this._params);
	}

	// Получение всех возможных друзей (отображаются на вкладке "Поиск" и в компоненте "Возможные друзья")
	override getAll() {
		if (!this.hasMore || this.items.length) {
			this.syncStore();
			return;
		}

		this._get();
	}

	// Получение еще возможных друзей в компоненте виртуального скролла
	override loadMore(resolve: () => void) {
		this._page += 1;
		super.loadMore(resolve);

		this._get();
	}

	// Поиск по записям в текущей вкладке
	override search(value: string) {
		if (value !== this.searchValue) {
			this._page = 0;
		}

		super.search(value);

		useFriendsStore.getState().setSearchPossibleFriends(this.searchValue);

		this.getByDebounce<GetAllGeneric>(this._params);
	}

	// Подписаться на пользователя
	follow(friendId: string, updateOutgoingRequests: (friend: IFriend) => void) {
		this._request.post({
			route: ApiRoutes.followFriend,
			data: { friendId },
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingFollowAction(isLoading);
			},
			successCb: () => {
				const friendToRemove = this.find(friendId);

				if (friendToRemove) {
					this.remove(friendId);

					// Обновление списка исходящих запросов
					updateOutgoingRequests(friendToRemove);

					this.syncStore();
				}
			},
		});
	}

	syncStore() {
		useFriendsStore.getState().setPossibleFriends({
			items: [ ...this.items ],
			count: this.count,
			hasMore: this.hasMore,
		});
	}
};