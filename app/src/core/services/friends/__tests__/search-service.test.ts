import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import SearchService from "../SearchService";

jest.mock("@utils/debounce", () => (fn: Function) => fn);

jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
	FRIENDS_LIMIT: 25,
}));

jest.mock("@store/friends", () => {
	const mockSetIsLoadingPossibleFriends = jest.fn();
	const mockSetSearchPossibleFriends = jest.fn();
	const mockSetPossibleFriends = jest.fn();
	const mockSetIsLoadingFollowAction = jest.fn();

	return {
		__esModule: true,
		default: {
			getState: jest.fn(() => ({
				setIsLoadingPossibleFriends: mockSetIsLoadingPossibleFriends,
				setSearchPossibleFriends: mockSetSearchPossibleFriends,
				setPossibleFriends: mockSetPossibleFriends,
				setIsLoadingFollowAction: mockSetIsLoadingFollowAction,
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
				possibleFriends: [
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

describe("SearchService", () => {
	let service: SearchService;
	let mockRequest: MockRequest;

	beforeEach(() => {
		mockRequest = new MockRequest();
		service = new SearchService(mockRequest as unknown as Request);
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should make request with correct params", () => {
			service.getAll();
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getPossibleFriends,
				data: expect.objectContaining({
					page: 0,
				}),
			}));
		});

		it("should not increment page on subsequent calls", () => {
			service.getAll();
			service.getAll();
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				data: expect.objectContaining({
					page: 0,
				}),
			}));
		});
	});

	describe("loadMore", () => {
		it("should call getMoreByDebounce with correct params", () => {
			const mockResolve = jest.fn();
			service.loadMore(mockResolve);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getPossibleFriends,
			}));
		});

		it("should increment page number on subsequent calls", () => {
			service.loadMore(() => {});
			service.loadMore(() => {});
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				data: expect.objectContaining({
					page: 1,
				}),
			}));
		});

		it("should maintain search value when loading more", () => {
			const searchValue = "test search";
			service.search(searchValue);
			service.loadMore(() => {});
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				data: expect.objectContaining({
					search: searchValue,
					page: 0,
				}),
			}));
		});
	});

	describe("search", () => {
		it("should update search value and call getByDebounce", () => {
			const searchValue = "test search";
			service.search(searchValue);
            
			expect(useFriendsStore.getState().setSearchPossibleFriends).toHaveBeenCalledWith(searchValue);
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getPossibleFriends,
				data: expect.objectContaining({
					search: searchValue,
				}),
			}));
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
            
			expect(useFriendsStore.getState().setPossibleFriends).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
		});
	});

	describe("follow", () => {
		it("should make follow request with correct params", () => {
			const friendId = "123";
			const updateOutgoingRequests = jest.fn();
            
			service.follow(friendId, updateOutgoingRequests);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.followFriend,
				data: { friendId },
			}));
		});

		it("should update loading state during follow request", () => {
			const friendId = "123";
			const updateOutgoingRequests = jest.fn();
            
			service.follow(friendId, updateOutgoingRequests);
            
			expect(useFriendsStore.getState().setIsLoadingFollowAction).toHaveBeenCalledWith(true);
		});

		it("should remove friend and update outgoing requests on success", () => {
			const friendId = "123";
			const mockFriend = { id: friendId, fullName: "Test User" } as IFriend;
			const updateOutgoingRequests = jest.fn();
            
			service["items"] = [ mockFriend ];
			service.follow(friendId, updateOutgoingRequests);
            
			expect(service["items"]).not.toContainEqual(mockFriend);
			expect(updateOutgoingRequests).toHaveBeenCalledWith(mockFriend);
			expect(useFriendsStore.getState().setPossibleFriends).toHaveBeenCalled();
		});

		it("should not update anything if friend not found", () => {
			const friendId = "123";
			const updateOutgoingRequests = jest.fn();
            
			service["items"] = [];
			service.follow(friendId, updateOutgoingRequests);
            
			expect(updateOutgoingRequests).not.toHaveBeenCalled();
			expect(useFriendsStore.getState().setPossibleFriends).not.toHaveBeenCalled();
		});
	});
});
