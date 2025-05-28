import { FriendsTab } from "common-types";

import type BlockedUsersService from "@core/services/friends/BlockedUsersService";
import type CommonFriendsService from "@core/services/friends/CommonFriendsService";
import type FollowersService from "@core/services/friends/FollowersService";
import type IncomingRequestsService from "@core/services/friends/IncomingService";
import type MyFriendsService from "@core/services/friends/MyFriendsService";
import type OnlineFriendsService from "@core/services/friends/OnlineFriendsService";
import type OutgoingRequestsService from "@core/services/friends/OutGouingRequestsService";
import type SearchService from "@core/services/friends/SearchService";
import i18n from "@service/i18n";
import useUIStore from "@store/ui";

// Контроллер по управлению друзьями текущего пользователя
export default class FriendsController {
	constructor(
        private readonly _myFriends: MyFriendsService,
        private readonly _onlineFriends: OnlineFriendsService,
        private readonly _followers: FollowersService,
        private readonly _outgoingRequests: OutgoingRequestsService,
        private readonly _incomingRequests: IncomingRequestsService,
        private readonly _searchFriends: SearchService,
        private readonly _blockedUsers: BlockedUsersService,
		private readonly _commonFriends: CommonFriendsService,
	) {}

	get myFriends() { return this._myFriends; }
	get onlineFriends() { return this._onlineFriends; }
	get followers() { return this._followers; }
	get outgoingRequests() { return this._outgoingRequests; }
	get incomingRequests() { return this._incomingRequests; }
	get searchFriends() { return this._searchFriends; }
	get blockedUsers() { return this._blockedUsers; }
	get commonFriends() { return this._commonFriends; }

	getFriends(type: FriendsTab) {
		switch (type) {
		case FriendsTab.MY:
			this._myFriends.getAll();
			break;
		case FriendsTab.ONLINE:
			this._onlineFriends.getAll();
			break;
		case FriendsTab.FOLLOWERS:
			this._followers.getAll();
			break;
		case FriendsTab.OUTGOING_REQUESTS:
			this._outgoingRequests.getAll();
			break;
		case FriendsTab.INCOMING_REQUESTS:
			this._incomingRequests.getAll();
			break;
		case FriendsTab.SEARCH:
			this._searchFriends.getAll();
			break;
		case FriendsTab.BLOCKED:
			this._blockedUsers.getAll();
			break;
		case FriendsTab.COMMON:
			this._commonFriends.getAll();
			break;
		default:
			useUIStore.getState().setError(i18n.t("friends-module.error.unknown_tab", { tab: type }));
		}
	}

	loadMore(type: FriendsTab, resolve: () => void) {
		switch (type) {
		case FriendsTab.MY:
			this._myFriends.loadMore(resolve);
			break;
		case FriendsTab.ONLINE:
			this._onlineFriends.loadMore(resolve);
			break;
		case FriendsTab.FOLLOWERS:
			this._followers.loadMore(resolve);
			break;
		case FriendsTab.OUTGOING_REQUESTS:
			this._outgoingRequests.loadMore(resolve);
			break;
		case FriendsTab.INCOMING_REQUESTS:
			this._incomingRequests.loadMore(resolve);
			break;
		case FriendsTab.SEARCH:
			this._searchFriends.loadMore(resolve);
			break;
		case FriendsTab.BLOCKED:
			this._blockedUsers.loadMore(resolve);
		case FriendsTab.COMMON:
			this._commonFriends.loadMore(resolve);
			break;
		default:
			useUIStore.getState().setError(i18n.t("friends-module.error.unknown_tab", { tab: type }));
		}
	}

	search(type: FriendsTab, value: string) {
		switch (type) {
		case FriendsTab.MY:
			this._myFriends.search(value);
			break;
		case FriendsTab.ONLINE:
			this._onlineFriends.search(value);
			break;
		case FriendsTab.FOLLOWERS:
			this._followers.search(value);
			break;
		case FriendsTab.OUTGOING_REQUESTS:
			this._outgoingRequests.search(value);
			break;
		case FriendsTab.INCOMING_REQUESTS:
			this._incomingRequests.search(value);
			break;
		case FriendsTab.SEARCH:
			this._searchFriends.search(value);
			break;
		case FriendsTab.BLOCKED:
			this._blockedUsers.search(value);
			break;
		case FriendsTab.COMMON:
			this._commonFriends.search(value);
			break;
		default:
			useUIStore.getState().setError(i18n.t("friends-module.error.unknown_tab", { tab: type }));
		}
	}
}