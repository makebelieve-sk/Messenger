import { ApiRoutes, FriendsTab } from "common-types";

import FriendsController from "@core/controllers/FriendsController";
import { type Friends } from "@core/models/Friends";
import type Request from "@core/Request";
import FriendsFactoryService from "@core/services/FriendsFactoryService";
import useFriendsStore, { type IGetAllCounts } from "@store/friends";
import { type IUser } from "@custom-types/models.types";

// Сервис для управления друзьями
export default class FriendsService implements Friends {
	private readonly _friendsController: FriendsController;
	private readonly _factory: FriendsFactoryService;

	constructor(private readonly _request: Request, private readonly _userId: string) {
		this._factory = new FriendsFactoryService(this._request, this._userId);

		this._friendsController = new FriendsController(
			this._factory.createFriendsManager(),
			this._factory.createOnlineFriendsManager(),
			this._factory.createFollowersManager(),
			this._factory.createOutgoingRequestsManager(),
			this._factory.createIncomingRequestsManager(),
			this._factory.createSearchService(),
			this._factory.createBlockedUsersManager(),
			this._factory.createCommonFriendsManager(),
		);
		this._getAllCounts();
	}

	get friendsController() {
		return this._friendsController;
	}

	// Получение всех количеств всех друзей на всех вкладках
	private _getAllCounts() {
		this._request.post({
			route: ApiRoutes.getAllCounts,
			data: { userId: this._userId },
			successCb: (data: IGetAllCounts) => {
				this._friendsController.myFriends.setCount(data.countMyFriends);
				this._friendsController.followers.setCount(data.countFollowers);
				this._friendsController.outgoingRequests.setCount(data.countOutgoingRequests);
				this._friendsController.incomingRequests.setCount(data.countIncomingRequests);
				this._friendsController.searchFriends.setCount(data.countSearchFriends);
				this._friendsController.blockedUsers.setCount(data.countBlockedFriends);
				this._friendsController.commonFriends.setCount(data.countCommonFriends);

				useFriendsStore.getState().setAllCounts(data);
			},
		});
	}

	// Проверка, кто из онлайн полььзователей являются друзьями текущего пользователя
	checkOnlineUsers(onlineUsers: IUser[]) {
		this._friendsController.onlineFriends.checkUsers(onlineUsers);
	}

	// Удалить онлайн пользователя из списка
	removeOnlineUser(userId: string) {
		this._friendsController.onlineFriends.removeUser(userId);
	}

	// Получение друзей в зависимости от типа вкладки
	getFriends(type: FriendsTab) {
		this._friendsController.getFriends(type);
	}

	// Получение еще друзей в зависимости от типа вкладки
	loadMore(type: FriendsTab, resolve: () => void) {
		this._friendsController.loadMore(type, resolve);
	}

	// Поиск друзей в зависимости от текущей вкладки по имени
	search(type: FriendsTab, value: string) {
		this._friendsController.search(type, value);
	}

	// Подписка на пользователя (добавляем его в друзья)
	followFriend(friendId: string) {
		this._friendsController.searchFriends.follow(
			friendId,
			friend => {
				this._friendsController.outgoingRequests.add(friend);
				this._friendsController.outgoingRequests.syncStore();
			},
		);
	}

	// Отправка сообщения (загрузка нового чата и переход в него)
	writeMessage(friendId: string) {
		this._friendsController.myFriends.writeMessage(friendId);
	}

	// Удаление друга
	deleteFriend(friendId: string) {
		this._friendsController.myFriends.deleteFriend(
			friendId,
			friend => {
				this._friendsController.followers.add(friend);
				this._friendsController.followers.syncStore();
				this._friendsController.onlineFriends.removeUser(friend.id);
			});
	}

	// Блокировка друга
	blockFriend(friendId: string) {
		this._friendsController.myFriends.blockFriend(
			friendId,
			friend => {
				this._friendsController.blockedUsers.add(friend);
				this._friendsController.blockedUsers.syncStore();
				this._friendsController.onlineFriends.removeUser(friend.id);
			},
		);
	}

	// Разблокировка пользователя
	unblock(friendId: string) {
		this._friendsController.blockedUsers.unblock(
			friendId,
			friend => {
				this._friendsController.searchFriends.add(friend);
				this._friendsController.searchFriends.syncStore();
			},
		);
	}

	// Добавление подписчика в друзья
	addFriend(friendId: string): void {
		this._friendsController.followers.addFriend(
			friendId,
			friend => {
				this._friendsController.myFriends.add(friend);
				this._friendsController.myFriends.syncStore();
			},
		);
	}

	// Принятие запроса дружбы (добавление в друзья)
	accept(friendId: string) {
		this._friendsController.incomingRequests.accept(
			friendId,
			friend => {
				this._friendsController.myFriends.add(friend);
				this._friendsController.myFriends.syncStore();
			},
		);
	}

	// Отклонение запроса дружбы (оставить в подписчиках)
	leftInFollowers(friendId: string) {
		this._friendsController.incomingRequests.leftInFollowers(
			friendId,
			friend => {
				this._friendsController.followers.add(friend);
				this._friendsController.followers.syncStore();
			},
		);
	}

	// Отменить запрос на дружбу (отмена отправленного запроса на дружбу)
	unfollow(friendId: string) {
		this._friendsController.outgoingRequests.unfollow(
			friendId,
			friend => {
				this._friendsController.searchFriends.add(friend);
				this._friendsController.searchFriends.syncStore();
			},
		);
	}
};