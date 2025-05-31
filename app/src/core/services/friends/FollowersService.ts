import { ApiRoutes } from "common-types";

import { type BaseFriends } from "@core/models/BaseFriends";
import type Request from "@core/Request";
import BaseFriendsService from "@core/services/friends/BaseFriendsService";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import { type IUser } from "@custom-types/models.types";
import { getFriendEntity } from "@utils/friends";

type GetAllGeneric = { followers: IUser[]; count: number; hasMore: boolean; };

// Сервис для управления подписчиками
export default class FollowersService extends BaseFriendsService implements BaseFriends {
	constructor(protected readonly _request: Request, protected readonly _userId: string) {
		super(_request, _userId);
	}

	private get _params() {
		return {
			route: ApiRoutes.getFollowers,
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingFollowers(isLoading);
			},
			successCb: (data: GetAllGeneric) => {
				const newFriends = data.followers
					.map(getFriendEntity)
					.filter(friend =>
						!this.items.some(existing => existing.id === friend.id),
					);
				this.items.push(...newFriends);

				this.syncStore();
			},
		};
	}

	// Получение всех подписчиков
	override getAll() {
		if (!this.hasMore || this.items.length) {
			this.syncStore();
			return;
		}

		super.getAll<GetAllGeneric>(this._params);
	}

	// Получение еще подписчиков в компоненте виртуального скролла
	override loadMore(resolve: () => void) {
		super.loadMore(resolve);

		this.getMoreByDebounce<GetAllGeneric>(this._params);
	}

	// Поиск по записям в текущей вкладке
	override search(value: string) {
		super.search(value);

		useFriendsStore.getState().setSearchFollowers(this.searchValue);

		this.getByDebounce<GetAllGeneric>(this._params);
	}

	// Добавление подписчика в друзья
	addFriend(friendId: string, updateFriends: (friend: IFriend) => void) {
		this._request.post({
			route: ApiRoutes.addFriend,
			data: { friendId },
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingAddFriendAction(isLoading);
			},
			successCb: () => {
				const friendToRemove = this.find(friendId);

				if (friendToRemove) {
					this.remove(friendId);

					// Обновление списка друзей
					updateFriends(friendToRemove);

					this.syncStore();
				}
			},
		});
	}

	syncStore() {
		useFriendsStore.getState().setFollowers({
			items: [ ...this.items ],
			hasMore: this.hasMore,
			count: this.count,
		});
	}
};