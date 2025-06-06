import { FriendsTab } from "common-types";

import FriendsController from "@core/controllers/FriendsController";
import type BlockedFriendsService from "@core/services/friends/BlockedFriendsService";
import type CommonFriendsService from "@core/services/friends/CommonFriendsService";
import type FollowersService from "@core/services/friends/FollowersService";
import type IncomingRequestsService from "@core/services/friends/IncomingService";
import type MyFriendsService from "@core/services/friends/MyFriendsService";
import type OnlineFriendsService from "@core/services/friends/OnlineFriendsService";
import type OutgoingRequestsService from "@core/services/friends/OutGouingRequestsService";
import type SearchService from "@core/services/friends/SearchService";
import useUIStore from "@store/ui";

jest.mock("@store/ui");

describe("FriendsController", () => {
	let controller: FriendsController;
	let mockMyFriends: jest.Mocked<MyFriendsService>;
	let mockOnlineFriends: jest.Mocked<OnlineFriendsService>;
	let mockFollowers: jest.Mocked<FollowersService>;
	let mockOutgoingRequests: jest.Mocked<OutgoingRequestsService>;
	let mockIncomingRequests: jest.Mocked<IncomingRequestsService>;
	let mockSearchFriends: jest.Mocked<SearchService>;
	let mockBlockedUsers: jest.Mocked<BlockedFriendsService>;
	let mockCommonFriends: jest.Mocked<CommonFriendsService>;

	beforeEach(() => {
		mockMyFriends = {
			getAll: jest.fn(),
			loadMore: jest.fn(),
			search: jest.fn(),
		} as unknown as jest.Mocked<MyFriendsService>;

		mockOnlineFriends = {
			getAll: jest.fn(),
			loadMore: jest.fn(),
			search: jest.fn(),
		} as unknown as jest.Mocked<OnlineFriendsService>;

		mockFollowers = {
			getAll: jest.fn(),
			loadMore: jest.fn(),
			search: jest.fn(),
		} as unknown as jest.Mocked<FollowersService>;

		mockOutgoingRequests = {
			getAll: jest.fn(),
			loadMore: jest.fn(),
			search: jest.fn(),
		} as unknown as jest.Mocked<OutgoingRequestsService>;

		mockIncomingRequests = {
			getAll: jest.fn(),
			loadMore: jest.fn(),
			search: jest.fn(),
		} as unknown as jest.Mocked<IncomingRequestsService>;

		mockSearchFriends = {
			getAll: jest.fn(),
			loadMore: jest.fn(),
			search: jest.fn(),
		} as unknown as jest.Mocked<SearchService>;

		mockBlockedUsers = {
			getAll: jest.fn(),
			loadMore: jest.fn(),
			search: jest.fn(),
		} as unknown as jest.Mocked<BlockedFriendsService>;

		mockCommonFriends = {
			getAll: jest.fn(),
			loadMore: jest.fn(),
			search: jest.fn(),
		} as unknown as jest.Mocked<CommonFriendsService>;

		controller = new FriendsController(
			mockMyFriends,
			mockOnlineFriends,
			mockFollowers,
			mockOutgoingRequests,
			mockIncomingRequests,
			mockSearchFriends,
			mockBlockedUsers,
			mockCommonFriends,
		);
	});

	describe("getters", () => {
		it("should return correct service instances", () => {
			expect(controller.myFriends).toBe(mockMyFriends);
			expect(controller.onlineFriends).toBe(mockOnlineFriends);
			expect(controller.followers).toBe(mockFollowers);
			expect(controller.outgoingRequests).toBe(mockOutgoingRequests);
			expect(controller.incomingRequests).toBe(mockIncomingRequests);
			expect(controller.searchFriends).toBe(mockSearchFriends);
			expect(controller.blockedUsers).toBe(mockBlockedUsers);
			expect(controller.commonFriends).toBe(mockCommonFriends);
		});
	});

	describe("getFriends", () => {
		it("should call getAll on myFriends service when type is MY", () => {
			controller.getFriends(FriendsTab.MY);
			expect(mockMyFriends.getAll).toHaveBeenCalled();
		});

		it("should call getAll on onlineFriends service when type is ONLINE", () => {
			controller.getFriends(FriendsTab.ONLINE);
			expect(mockOnlineFriends.getAll).toHaveBeenCalled();
		});

		it("should call getAll on followers service when type is FOLLOWERS", () => {
			controller.getFriends(FriendsTab.FOLLOWERS);
			expect(mockFollowers.getAll).toHaveBeenCalled();
		});

		it("should call getAll on outgoingRequests service when type is OUTGOING_REQUESTS", () => {
			controller.getFriends(FriendsTab.OUTGOING_REQUESTS);
			expect(mockOutgoingRequests.getAll).toHaveBeenCalled();
		});

		it("should call getAll on incomingRequests service when type is INCOMING_REQUESTS", () => {
			controller.getFriends(FriendsTab.INCOMING_REQUESTS);
			expect(mockIncomingRequests.getAll).toHaveBeenCalled();
		});

		it("should call getAll on searchFriends service when type is SEARCH", () => {
			controller.getFriends(FriendsTab.SEARCH);
			expect(mockSearchFriends.getAll).toHaveBeenCalled();
		});

		it("should call getAll on blockedUsers service when type is BLOCKED", () => {
			controller.getFriends(FriendsTab.BLOCKED);
			expect(mockBlockedUsers.getAll).toHaveBeenCalled();
		});

		it("should call getAll on commonFriends service when type is COMMON", () => {
			controller.getFriends(FriendsTab.COMMON);
			expect(mockCommonFriends.getAll).toHaveBeenCalled();
		});

		it("should show error for unknown tab type", () => {
			const mockSetError = jest.fn();
			(useUIStore.getState as jest.Mock).mockReturnValue({ setError: mockSetError });

			controller.getFriends(999 as FriendsTab);

			expect(mockSetError).toHaveBeenCalled();
		});
	});

	describe("loadMore", () => {
		it("should call loadMore on myFriends service when type is MY", () => {
			const resolve = jest.fn();
			controller.loadMore(FriendsTab.MY, resolve);
			expect(mockMyFriends.loadMore).toHaveBeenCalledWith(resolve);
		});

		it("should call loadMore on onlineFriends service when type is ONLINE", () => {
			const resolve = jest.fn();
			controller.loadMore(FriendsTab.ONLINE, resolve);
			expect(mockOnlineFriends.loadMore).toHaveBeenCalledWith(resolve);
		});

		it("should call loadMore on followers service when type is FOLLOWERS", () => {
			const resolve = jest.fn();
			controller.loadMore(FriendsTab.FOLLOWERS, resolve);
			expect(mockFollowers.loadMore).toHaveBeenCalledWith(resolve);
		});

		it("should call loadMore on outgoingRequests service when type is OUTGOING_REQUESTS", () => {
			const resolve = jest.fn();
			controller.loadMore(FriendsTab.OUTGOING_REQUESTS, resolve);
			expect(mockOutgoingRequests.loadMore).toHaveBeenCalledWith(resolve);
		});

		it("should call loadMore on incomingRequests service when type is INCOMING_REQUESTS", () => {
			const resolve = jest.fn();
			controller.loadMore(FriendsTab.INCOMING_REQUESTS, resolve);
			expect(mockIncomingRequests.loadMore).toHaveBeenCalledWith(resolve);
		});

		it("should call loadMore on searchFriends service when type is SEARCH", () => {
			const resolve = jest.fn();
			controller.loadMore(FriendsTab.SEARCH, resolve);
			expect(mockSearchFriends.loadMore).toHaveBeenCalledWith(resolve);
		});

		it("should call loadMore on blockedUsers service when type is BLOCKED", () => {
			const resolve = jest.fn();
			controller.loadMore(FriendsTab.BLOCKED, resolve);
			expect(mockBlockedUsers.loadMore).toHaveBeenCalledWith(resolve);
		});

		it("should call loadMore on commonFriends service when type is COMMON", () => {
			const resolve = jest.fn();
			controller.loadMore(FriendsTab.COMMON, resolve);
			expect(mockCommonFriends.loadMore).toHaveBeenCalledWith(resolve);
		});

		it("should show error for unknown tab type", () => {
			const mockSetError = jest.fn();
			(useUIStore.getState as jest.Mock).mockReturnValue({ setError: mockSetError });

			controller.loadMore(999 as FriendsTab, jest.fn());

			expect(mockSetError).toHaveBeenCalled();
		});
	});

	describe("search", () => {
		it("should call search on myFriends service when type is MY", () => {
			const searchValue = "test";
			controller.search(FriendsTab.MY, searchValue);
			expect(mockMyFriends.search).toHaveBeenCalledWith(searchValue);
		});

		it("should call search on onlineFriends service when type is ONLINE", () => {
			const searchValue = "test";
			controller.search(FriendsTab.ONLINE, searchValue);
			expect(mockOnlineFriends.search).toHaveBeenCalledWith(searchValue);
		});

		it("should call search on followers service when type is FOLLOWERS", () => {
			const searchValue = "test";
			controller.search(FriendsTab.FOLLOWERS, searchValue);
			expect(mockFollowers.search).toHaveBeenCalledWith(searchValue);
		});

		it("should call search on outgoingRequests service when type is OUTGOING_REQUESTS", () => {
			const searchValue = "test";
			controller.search(FriendsTab.OUTGOING_REQUESTS, searchValue);
			expect(mockOutgoingRequests.search).toHaveBeenCalledWith(searchValue);
		});

		it("should call search on incomingRequests service when type is INCOMING_REQUESTS", () => {
			const searchValue = "test";
			controller.search(FriendsTab.INCOMING_REQUESTS, searchValue);
			expect(mockIncomingRequests.search).toHaveBeenCalledWith(searchValue);
		});

		it("should call search on searchFriends service when type is SEARCH", () => {
			const searchValue = "test";
			controller.search(FriendsTab.SEARCH, searchValue);
			expect(mockSearchFriends.search).toHaveBeenCalledWith(searchValue);
		});

		it("should call search on blockedUsers service when type is BLOCKED", () => {
			const searchValue = "test";
			controller.search(FriendsTab.BLOCKED, searchValue);
			expect(mockBlockedUsers.search).toHaveBeenCalledWith(searchValue);
		});

		it("should call search on commonFriends service when type is COMMON", () => {
			const searchValue = "test";
			controller.search(FriendsTab.COMMON, searchValue);
			expect(mockCommonFriends.search).toHaveBeenCalledWith(searchValue);
		});

		it("should show error for unknown tab type", () => {
			const mockSetError = jest.fn();
			(useUIStore.getState as jest.Mock).mockReturnValue({ setError: mockSetError });

			controller.search(999 as FriendsTab, "test");

			expect(mockSetError).toHaveBeenCalled();
		});
	});
});
