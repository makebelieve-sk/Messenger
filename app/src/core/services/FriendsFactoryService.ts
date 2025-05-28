import { type FriendsFactory } from "@core/models/FriendsFactory";
import type Request from "@core/Request";
import BlockedUsersService from "@core/services/friends/BlockedUsersService";
import FollowersService from "@core/services/friends/FollowersService";
import IncomingRequestsService from "@core/services/friends/IncomingService";
import MyFriendsService from "@core/services/friends/MyFriendsService";
import OnlineFriendsService from "@core/services/friends/OnlineFriendsService";
import OutgoingRequestsService from "@core/services/friends/OutGouingRequestsService";
import SearchService from "@core/services/friends/SearchService";
import CommonFriendsService from "@core/services/friends/CommonFriendsService";

// Фабрика для создания сущностей управления друзьями
export default class FriendsFactoryService implements FriendsFactory {
	constructor(protected readonly _request: Request, private readonly _userId: string) {}

	createFriendsManager() {
		return new MyFriendsService(this._request, this._userId);
	}
    
	createOnlineFriendsManager() {
		return new OnlineFriendsService(this._request, this._userId);
	}

	createFollowersManager() {
		return new FollowersService(this._request, this._userId);
	}

	createOutgoingRequestsManager() {
		return new OutgoingRequestsService(this._request);
	}

	createIncomingRequestsManager() {
		return new IncomingRequestsService(this._request);
	}

	createSearchService() {
		return new SearchService(this._request);
	}

	createBlockedUsersManager() {
		return new BlockedUsersService(this._request);
	}

	createCommonFriendsManager() {
		return new CommonFriendsService(this._request, this._userId);
	}
};