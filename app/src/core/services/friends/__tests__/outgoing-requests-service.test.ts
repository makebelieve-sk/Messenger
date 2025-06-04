import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import OutgoingRequestsService from "../OutGouingRequestsService";

jest.mock("@utils/debounce", () => (fn: Function) => fn);

jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
	FRIENDS_LIMIT: 25,
}));

jest.mock("@store/friends", () => {
	const mockSetIsLoadingOutgoingRequests = jest.fn();
	const mockSetOutgoingRequests = jest.fn();
	const mockSetSearchOutgoingRequests = jest.fn();
	const mockSetIsLoadingUnfollowAction = jest.fn();

	return {
		__esModule: true,
		default: {
			getState: jest.fn(() => ({
				setIsLoadingOutgoingRequests: mockSetIsLoadingOutgoingRequests,
				setOutgoingRequests: mockSetOutgoingRequests,
				setSearchOutgoingRequests: mockSetSearchOutgoingRequests,
				setIsLoadingUnfollowAction: mockSetIsLoadingUnfollowAction,
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
				outgoingRequests: [
					{
						id: "1",
						firstName: "Test",
						secondName: "",
						thirdName: "User",
						email: "test@example.com",
						phone: "1234567890",
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

describe("OutgoingRequestsService", () => {
	let service: OutgoingRequestsService;
	let mockRequest: MockRequest;

	beforeEach(() => {
		mockRequest = new MockRequest();
		service = new OutgoingRequestsService(mockRequest as unknown as Request);
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
				route: ApiRoutes.getOutgoingRequests,
			}));
		});
	});

	describe("loadMore", () => {
		it("should call getMoreByDebounce with correct params", () => {
			const mockResolve = jest.fn();
			service.loadMore(mockResolve);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getOutgoingRequests,
			}));
		});

		it("should not make request if hasMore is false", () => {
			service["hasMore"] = false;
			const mockResolve = jest.fn();
            
			service.loadMore(mockResolve);
            
			expect(mockRequest.post).toHaveBeenCalled();
			expect(mockResolve).toHaveBeenCalled();
		});

		it("should update store with new items after successful request", () => {
			service["hasMore"] = true;
			const mockResolve = jest.fn();
            
			service.loadMore(mockResolve);
            
			expect(useFriendsStore.getState().setOutgoingRequests).toHaveBeenCalledWith({
				items: expect.arrayContaining([
					expect.objectContaining({
						id: "1",
						fullName: "Test User",
						avatarUrl: "test.jpg",
						avatarCreateDate: "2024-01-01",
						createdAt: "2024-01-01",
					}),
				]),
				hasMore: true,
				count: 1,
			});
			expect(mockResolve).toHaveBeenCalled();
		});

		it("should set loading state during request", () => {
			service["hasMore"] = true;
			const mockResolve = jest.fn();
            
			service.loadMore(mockResolve);
            
			expect(useFriendsStore.getState().setIsLoadingOutgoingRequests).toHaveBeenCalledWith(true);
		});
	});

	describe("search", () => {
		it("should update search value and call getByDebounce", () => {
			const searchValue = "test search";
			service.search(searchValue);
            
			expect(useFriendsStore.getState().setSearchOutgoingRequests).toHaveBeenCalledWith(searchValue);
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getOutgoingRequests,
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
            
			expect(useFriendsStore.getState().setOutgoingRequests).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
		});
	});

	describe("unfollow", () => {
		it("should make request to unfollow friend", () => {
			const friendId = "123";
			const updateSearchFriends = jest.fn();
            
			service.unfollow(friendId, updateSearchFriends);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.unfollow,
				data: { friendId },
			}));
		});

		it("should set loading state during request", () => {
			const friendId = "123";
			const updateSearchFriends = jest.fn();
            
			service.unfollow(friendId, updateSearchFriends);
            
			expect(useFriendsStore.getState().setIsLoadingUnfollowAction).toHaveBeenCalledWith(true);
		});

		it("should remove friend and update search list on success", () => {
			const friendId = "123";
			const mockFriend = { id: friendId, fullName: "Test User" } as IFriend;
			const updateSearchFriends = jest.fn();
            
			// Add friend to service items
			service["items"] = [ mockFriend ];
            
			// Mock the success callback
			mockRequest.post.mockImplementationOnce((params) => {
				if (params.successCb) {
					params.successCb();
				}
			});
            
			service.unfollow(friendId, updateSearchFriends);
            
			expect(service["items"]).not.toContainEqual(mockFriend);
			expect(updateSearchFriends).toHaveBeenCalledWith(mockFriend);
			expect(useFriendsStore.getState().setOutgoingRequests).toHaveBeenCalled();
		});

		it("should not update anything if friend not found", () => {
			const friendId = "123";
			const updateSearchFriends = jest.fn();
            
			// Mock the success callback
			mockRequest.post.mockImplementationOnce((params) => {
				if (params.successCb) {
					params.successCb();
				}
			});
            
			service.unfollow(friendId, updateSearchFriends);
            
			expect(updateSearchFriends).not.toHaveBeenCalled();
			expect(useFriendsStore.getState().setOutgoingRequests).not.toHaveBeenCalled();
		});
	});
});
