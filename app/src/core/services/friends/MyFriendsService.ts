import { ApiRoutes } from "common-types";

import { type BaseFriends } from "@core/models/BaseFriends";
import type Request from "@core/Request";
import BaseFriendsService from "@core/services/friends/BaseFriendsService";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import { type IUser } from "@custom-types/models.types";
import { getFriendEntity } from "@utils/friends";

type GetAllGeneric = { myFriends: IUser[]; count: number; hasMore: boolean; };

// Сервис для управления друзьями текущего пользователя
export default class MyFriendsService extends BaseFriendsService implements BaseFriends {
	constructor( protected readonly _request: Request, protected readonly _userId: string) {
		super(_request, _userId);
	}

	private get _params() {
		return {
			route: ApiRoutes.getMyFriends,
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingMyFriends(isLoading);
			},
			successCb: (data: GetAllGeneric) => {
				const newFriends = data.myFriends
					.map(getFriendEntity)
					.filter(friend =>
						!this.items.some(existing => existing.id === friend.id),
					);
				this.items.push(...newFriends);

				this.syncStore();
			},
		};
	}

	// Получение всех друзей текущего пользователя
	override getAll() {
		const isLoadingMyFriends = useFriendsStore.getState().isLoadingMyFriends;

		if (!this.hasMore || this.items.length || isLoadingMyFriends) {
			this.syncStore();
			return;
		}

		super.getAll<GetAllGeneric>(this._params);
	}

	// Получение еще друзей в компоненте виртуального скролла
	override loadMore(resolve: () => void) {
		super.loadMore(resolve);

		this.getMoreByDebounce<GetAllGeneric>(this._params);
	}

	// Поиск по записям в текущей вкладке
	override search(value: string) {
		super.search(value);

		useFriendsStore.getState().setSearchMyFriends(this.searchValue);

		this.getByDebounce<GetAllGeneric>(this._params);
	}

	// Отправка сообщения (загрузка нового чата и переход в него)
	writeMessage(friendId: string) {
		// eslint-disable-next-line no-console
		console.log("writeMessage", friendId);
	}

	// Удаление друга (перенос его в раздел "Подписчики")
	deleteFriend(friendId: string, updateFollowers: (friend: IFriend) => void) {
		this._request.post({
			route: ApiRoutes.deleteFriend,
			data: { friendId },
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingDeleteFriendAction(isLoading);
			},
			successCb: () => {
				const friendToRemove = this.find(friendId);

				if (friendToRemove) {
					this.remove(friendId);

					// Обновление списка подписчиков
					updateFollowers(friendToRemove);

					this.syncStore();
				}
			},
		});
	}

	// Блокировка друга
	blockFriend(friendId: string, updateBlockFriends: (friend: IFriend) => void) {
		this._request.post({
			route: ApiRoutes.blockFriend,
			data: { friendId },
			setLoading: (isLoading: boolean) => {
				useFriendsStore.getState().setIsLoadingBlockFriendAction(isLoading);
			},
			successCb: () => {
				const friendToRemove = this.find(friendId);

				if (friendToRemove) {
					this.remove(friendId);

					// Обновляем список заблокированных пользователей
					updateBlockFriends(friendToRemove);

					this.syncStore();
				}
			},
		});
	}

	syncStore() {
		useFriendsStore.getState().setMyFriends({
			items: [ ...this.items ],
			hasMore: this.hasMore,
			count: this.count,
		});
	}
};