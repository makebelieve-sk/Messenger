import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import MyFriendsService from "../MyFriendsService";

jest.mock("@utils/debounce", () => (fn: Function) => fn);

jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
	FRIENDS_LIMIT: 25,
}));

jest.mock("@store/friends", () => {
	const mockSetIsLoadingMyFriends = jest.fn();
	const mockSetIsLoadingBlockFriendAction = jest.fn();
	const mockSetIsLoadingDeleteFriendAction = jest.fn();
	const mockSetMyFriends = jest.fn();
	const mockSetSearchMyFriends = jest.fn();

	return {
		__esModule: true,
		default: {
			getState: jest.fn(() => ({
				setIsLoadingMyFriends: mockSetIsLoadingMyFriends,
				setIsLoadingBlockFriendAction: mockSetIsLoadingBlockFriendAction,
				setIsLoadingDeleteFriendAction: mockSetIsLoadingDeleteFriendAction,
				setMyFriends: mockSetMyFriends,
				setSearchMyFriends: mockSetSearchMyFriends,
			})),
		},
	};
});

class MockRequest {
	private mockResponse;

	constructor(mockResponse?) {
		this.mockResponse = mockResponse || {
			success: true,
			myFriends: [
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
		};
	}

	post = jest.fn().mockImplementation((params) => {
		if (params.setLoading) {
			params.setLoading(true);
		}
		if (params.successCb) {
			params.successCb(this.mockResponse);
		}
	});
}

describe("MyFriendsService", () => {
	let service: MyFriendsService;
	let mockRequest: MockRequest;
	const mockUserId = "test-user-id";

	beforeEach(() => {
		mockRequest = new MockRequest();
		service = new MyFriendsService(mockRequest as unknown as Request, mockUserId);
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
				route: ApiRoutes.getMyFriends,
				data: expect.objectContaining({
					userId: mockUserId,
				}),
			}));
		});

		it("should update store and service state on successful response", () => {
			service["hasMore"] = true;
			service["items"] = [];
            
			service.getAll();
            
			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb({
				success: true,
				myFriends: [
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
			expect(useFriendsStore.getState().setMyFriends).toHaveBeenCalledWith({
				items: service["items"],
				hasMore: true,
				count: 1,
			});
		});

		it("should handle empty response", () => {
			mockRequest = new MockRequest({
				success: true,
				myFriends: [],
				hasMore: false,
				count: 0,
			});
			service = new MyFriendsService(mockRequest as unknown as Request, mockUserId);
            
			service["hasMore"] = true;
			service["items"] = [];
            
			service.getAll();
            
			expect(service["items"]).toHaveLength(0);
			expect(service["hasMore"]).toBe(false);
			expect(service["count"]).toBe(0);
			expect(useFriendsStore.getState().setMyFriends).toHaveBeenCalledWith({
				items: [],
				hasMore: false,
				count: 0,
			});
		});
	});

	describe("loadMore", () => {
		it("should call getMoreByDebounce with correct params", () => {
			const mockResolve = jest.fn();
			service.loadMore(mockResolve);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getMyFriends,
				data: expect.objectContaining({
					userId: mockUserId,
				}),
			}));
		});
	});

	describe("search", () => {
		it("should update search value and call getByDebounce", () => {
			const searchValue = "test search";
			service.search(searchValue);
            
			expect(useFriendsStore.getState().setSearchMyFriends).toHaveBeenCalledWith(searchValue);
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getMyFriends,
				data: expect.objectContaining({
					userId: mockUserId,
					search: searchValue,
				}),
			}));
		});
	});

	describe("blockFriend", () => {
		const mockFriendId = "friend-1";
		const mockUpdateBlockFriends = jest.fn();
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

		it("should make block request and update store on success", () => {
			service.blockFriend(mockFriendId, mockUpdateBlockFriends);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.blockFriend,
				data: { friendId: mockFriendId },
			}));
            
			// Simulate success callback
			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();
            
			expect(mockUpdateBlockFriends).toHaveBeenCalledWith(mockFriend);
			expect(service["items"]).toHaveLength(0);
		});
	});

	describe("deleteFriend", () => {
		const mockFriendId = "friend-1";
		const mockUpdateFollowers = jest.fn();
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
			jest.clearAllMocks();
		});

		it("should make delete request and update store on success", () => {
			service.deleteFriend(mockFriendId, mockUpdateFollowers);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.deleteFriend,
				data: { friendId: mockFriendId },
			}));
            
			// Simulate success callback
			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();
            
			expect(mockUpdateFollowers).toHaveBeenCalledWith(mockFriend);
			expect(service["items"]).toHaveLength(0);
			expect(useFriendsStore.getState().setMyFriends).toHaveBeenCalled();
		});

		it("should set loading state during request", () => {
			service.deleteFriend(mockFriendId, mockUpdateFollowers);
            
			const setLoading = mockRequest.post.mock.calls[0][0].setLoading;
			setLoading(true);
            
			expect(useFriendsStore.getState().setIsLoadingDeleteFriendAction).toHaveBeenCalledWith(true);
		});

		it("should not update followers if friend is not found", () => {
			service["items"] = [];
			service.deleteFriend(mockFriendId, mockUpdateFollowers);
            
			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();
            
			expect(mockUpdateFollowers).not.toHaveBeenCalled();
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
            
			expect(useFriendsStore.getState().setMyFriends).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
		});
	});
});
