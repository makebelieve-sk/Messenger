import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import BlockedFriendsService from "../BlockedFriendsService";

jest.mock("@utils/debounce", () => (fn: Function) => fn);

jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
	FRIENDS_LIMIT: 25,
}));

jest.mock("@store/friends", () => {
	const mockSetIsLoadingBlockFriends = jest.fn();
	const mockSetIsLoadingUnblockAction = jest.fn();
	const mockSetBlockedFriends = jest.fn();
	const mockSetSearchBlockedFriends = jest.fn();

	return {
		__esModule: true,
		default: {
			getState: jest.fn(() => ({
				setIsLoadingBlockFriends: mockSetIsLoadingBlockFriends,
				setIsLoadingUnblockAction: mockSetIsLoadingUnblockAction,
				setBlockedFriends: mockSetBlockedFriends,
				setSearchBlockedFriends: mockSetSearchBlockedFriends,
			})),
		},
	};
});

class MockRequest {
	post = jest.fn().mockImplementation((params) => {
		if (params.setLoading) {
			params.setLoading(true);
		}
		if (params.successCb) {
			params.successCb({
				success: true,
				blockedFriends: [
					{
						id: "1",
						fullName: "Test User",
						avatarUrl: "test.jpg",
						avatarCreateDate: "2024-01-01",
						createdAt: "2024-01-01",
						newest: false,
					},
				],
				hasMore: true,
				count: 1,
			});
		}
	});
}

describe("BlockedFriendsService", () => {
	let service: BlockedFriendsService;
	let mockRequest: MockRequest;

	beforeEach(() => {
		mockRequest = new MockRequest();
		service = new BlockedFriendsService(mockRequest as unknown as Request);
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should not make request if hasMore is false and items exist", () => {
			service["hasMore"] = false;
			service["items"] = [ { id: "1" } as IFriend ];
            
			service.getAll();
            
			expect(mockRequest.post).not.toHaveBeenCalled();
		});

		it("should make request if hasMore is true and no items exist", () => {
			service["hasMore"] = true;
			service["items"] = [];
            
			service.getAll();
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getBlockedFriends,
			}));
		});
	});

	describe("loadMore", () => {
		it("should call getMoreByDebounce with correct params", () => {
			const mockResolve = jest.fn();
			service.loadMore(mockResolve);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getBlockedFriends,
			}));
		});
	});

	describe("search", () => {
		it("should update search value and call getByDebounce", () => {
			const searchValue = "test search";
			service.search(searchValue);
            
			expect(useFriendsStore.getState().setSearchBlockedFriends).toHaveBeenCalledWith(searchValue);
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getBlockedFriends,
				data: expect.objectContaining({
					search: searchValue,
				}),
			}));
		});
	});

	describe("unblock", () => {
		const mockFriendId = "friend-1";
		const mockUpdateSearchFriends = jest.fn();
		const mockFriend: IFriend = {
			id: mockFriendId,
			fullName: "John Doe",
			avatarUrl: "avatar.jpg",
			avatarCreateDate: "2024-01-01",
			createdAt: "2024-01-01",
			newest: false,
		};

		beforeEach(() => {
			service["items"] = [ mockFriend ];
		});

		it("should make unblock request and update store on success", () => {
			service.unblock(mockFriendId, mockUpdateSearchFriends);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.unblockFriend,
				data: { friendId: mockFriendId },
			}));
            
			// Simulate success callback
			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();
            
			expect(mockUpdateSearchFriends).toHaveBeenCalledWith(mockFriend);
			expect(service["items"]).toHaveLength(0);
		});
	});

	describe("syncStore", () => {
		it("should update store with current state", () => {
			const mockItems = [ { id: "1" } as IFriend ];
			const mockHasMore = true;
			const mockCount = 1;
            
			service["items"] = mockItems;
			service["hasMore"] = mockHasMore;
			service["count"] = mockCount;
            
			service.syncStore();
            
			expect(useFriendsStore.getState().setBlockedFriends).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
		});
	});
});
