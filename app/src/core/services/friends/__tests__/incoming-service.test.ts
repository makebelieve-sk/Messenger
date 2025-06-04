import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import IncomingRequestsService from "../IncomingService";

jest.mock("@utils/debounce", () => (fn: Function) => fn);

jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
	FRIENDS_LIMIT: 25,
}));

jest.mock("@store/friends", () => ({
	__esModule: true,
	default: {
		getState: jest.fn().mockReturnValue({
			setIncomingRequests: jest.fn(),
			setSearchIncomingRequests: jest.fn(),
			removeFriendsNotification: jest.fn(),
			setIsLoadingIncomingRequests: jest.fn(),
			setIsLoadingAcceptAction: jest.fn(),
			setIsLoadingLeftInFollowersAction: jest.fn(),
		}),
	},
}));

class MockRequest {
	post = jest.fn().mockImplementation((params) => {
		if (params.setLoading) {
			params.setLoading(true);
		}
		if (params.successCb) {
			params.successCb({
				success: true,
				incomingRequests: [
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

describe("IncomingRequestsService", () => {
	let service: IncomingRequestsService;
	let mockRequest: MockRequest;

	beforeEach(() => {
		mockRequest = new MockRequest();
		service = new IncomingRequestsService(mockRequest as unknown as Request);
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
				route: ApiRoutes.getIncomingRequests,
				data: expect.objectContaining({
					limit: 25,
					page: undefined,
					search: "",
					userId: undefined,
					lastCreatedAt: undefined,
				}),
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			}));
		});
	});

	describe("loadMore", () => {
		it("should call getMoreByDebounce with correct params", () => {
			const mockResolve = jest.fn();
			service.loadMore(mockResolve);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getIncomingRequests,
				data: expect.objectContaining({
					limit: 25,
					page: undefined,
					search: "",
					userId: undefined,
					lastCreatedAt: undefined,
				}),
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			}));
		});

		it("should update items and hasMore when request is successful", () => {
			const mockResolve = jest.fn();
			service.loadMore(mockResolve);
            
			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb({
				success: true,
				incomingRequests: [
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

			expect(service["items"]).toHaveLength(1);
			expect(service["hasMore"]).toBe(true);
			expect(service["count"]).toBe(1);
			expect(mockResolve).toHaveBeenCalled();
		});
	});

	describe("search", () => {
		it("should update search value and call getByDebounce", () => {
			const searchValue = "test search";
			service.search(searchValue);
            
			expect(useFriendsStore.getState().setSearchIncomingRequests).toHaveBeenCalledWith(searchValue);
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getIncomingRequests,
				data: expect.objectContaining({
					limit: 25,
					page: undefined,
					search: searchValue,
					userId: undefined,
					lastCreatedAt: undefined,
				}),
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			}));
		});

		it("should reset items and update store when search is successful", () => {
			const searchValue = "test search";
			service.search(searchValue);
            
			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb({
				success: true,
				incomingRequests: [
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

			expect(service["items"]).toHaveLength(1);
			expect(service["hasMore"]).toBe(true);
			expect(service["count"]).toBe(1);
			expect(useFriendsStore.getState().setIncomingRequests).toHaveBeenCalledWith({
				items: service["items"],
				hasMore: true,
				count: 1,
			});
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
            
			expect(useFriendsStore.getState().setIncomingRequests).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
		});
	});

	describe("accept", () => {
		it("should make request to accept friend request", () => {
			const friendId = "123";
			const updateFriends = jest.fn();
			service["items"] = [ { id: friendId } as IFriend ];

			service.accept(friendId, updateFriends);

			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.acceptFriendRequest,
				data: { friendId },
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			}));
		});

		it("should handle successful friend request acceptance", () => {
			const friendId = "123";
			const updateFriends = jest.fn();
			const mockFriend = { id: friendId } as IFriend;
			service["items"] = [ mockFriend ];

			service.accept(friendId, updateFriends);

			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();

			expect(updateFriends).toHaveBeenCalledWith(mockFriend);
			expect(useFriendsStore.getState().removeFriendsNotification).toHaveBeenCalled();
			expect(service["items"]).not.toContain(mockFriend);
		});

		it("should not update anything if friend is not found", () => {
			const friendId = "123";
			const updateFriends = jest.fn();
			service["items"] = [];

			service.accept(friendId, updateFriends);

			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();

			expect(updateFriends).not.toHaveBeenCalled();
			expect(useFriendsStore.getState().removeFriendsNotification).not.toHaveBeenCalled();
		});
	});

	describe("leftInFollowers", () => {
		it("should make request to leave user in followers", () => {
			const friendId = "123";
			const updateFollowers = jest.fn();
			service["items"] = [ { id: friendId } as IFriend ];

			service.leftInFollowers(friendId, updateFollowers);

			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.leftInFollowers,
				data: { friendId },
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			}));
		});

		it("should handle successful leave in followers action", () => {
			const friendId = "123";
			const updateFollowers = jest.fn();
			const mockFriend = { id: friendId } as IFriend;
			service["items"] = [ mockFriend ];

			service.leftInFollowers(friendId, updateFollowers);

			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();

			expect(updateFollowers).toHaveBeenCalledWith(mockFriend);
			expect(useFriendsStore.getState().removeFriendsNotification).toHaveBeenCalled();
			expect(service["items"]).not.toContain(mockFriend);
		});

		it("should not update anything if friend is not found", () => {
			const friendId = "123";
			const updateFollowers = jest.fn();
			service["items"] = [];

			service.leftInFollowers(friendId, updateFollowers);

			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();

			expect(updateFollowers).not.toHaveBeenCalled();
			expect(useFriendsStore.getState().removeFriendsNotification).not.toHaveBeenCalled();
		});
	});
});
