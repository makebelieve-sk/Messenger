import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import FollowersService from "../FollowersService";

jest.mock("@utils/debounce", () => (fn: Function) => fn);

jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
	FRIENDS_LIMIT: 25,
}));

jest.mock("@store/friends", () => {
	const mockSetIsLoadingFollowers = jest.fn();
	const mockSetIsLoadingAddFriendAction = jest.fn();
	const mockSetFollowers = jest.fn();
	const mockSetSearchFollowers = jest.fn();

	return {
		__esModule: true,
		default: {
			getState: jest.fn(() => ({
				setIsLoadingFollowers: mockSetIsLoadingFollowers,
				setIsLoadingAddFriendAction: mockSetIsLoadingAddFriendAction,
				setFollowers: mockSetFollowers,
				setSearchFollowers: mockSetSearchFollowers,
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
				followers: [
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

describe("FollowersService", () => {
	let service: FollowersService;
	let mockRequest: MockRequest;
	const mockUserId = "test-user-id";

	beforeEach(() => {
		mockRequest = new MockRequest();
		service = new FollowersService(mockRequest as unknown as Request, mockUserId);
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should make request with correct params", () => {
			service.getAll();
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getFollowers,
				data: expect.objectContaining({
					userId: mockUserId,
				}),
			}));
		});

		it("should not make request if hasMore is false or items exist", () => {
			service["hasMore"] = false;
			service["items"] = [ { id: "1" } as IFriend ];
            
			service.getAll();
            
			expect(mockRequest.post).not.toHaveBeenCalled();
			expect(useFriendsStore.getState().setFollowers).toHaveBeenCalledWith({
				items: [ { id: "1" } ],
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
				route: ApiRoutes.getFollowers,
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
            
			expect(useFriendsStore.getState().setSearchFollowers).toHaveBeenCalledWith(searchValue);
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getFollowers,
				data: expect.objectContaining({
					userId: mockUserId,
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
            
			expect(useFriendsStore.getState().setFollowers).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
		});
	});

	describe("addFriend", () => {
		it("should add friend and update store", () => {
			const mockFriend = { id: "1", fullName: "Test User" } as IFriend;
			const mockUpdateFriends = jest.fn();
            
			service["items"] = [ mockFriend ];
            
			service.addFriend("1", mockUpdateFriends);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.addFriend,
				data: { friendId: "1" },
			}));
            
			// Simulate success callback
			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();
            
			expect(service["items"]).toHaveLength(0);
			expect(mockUpdateFriends).toHaveBeenCalledWith(mockFriend);
			expect(useFriendsStore.getState().setFollowers).toHaveBeenCalledWith({
				items: [],
				hasMore: true,
				count: 0,
			});
		});

		it("should not update store if friend not found", () => {
			const mockUpdateFriends = jest.fn();
            
			service.addFriend("non-existent", mockUpdateFriends);
            
			// Simulate success callback
			const successCb = mockRequest.post.mock.calls[0][0].successCb;
			successCb();
            
			expect(mockUpdateFriends).not.toHaveBeenCalled();
			expect(useFriendsStore.getState().setFollowers).not.toHaveBeenCalled();
		});
	});
});
