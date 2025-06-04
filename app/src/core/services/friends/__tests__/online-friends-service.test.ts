import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import { type IUser } from "@custom-types/models.types";
import OnlineFriendsService from "../OnlineFriendsService";

jest.mock("@utils/debounce", () => (fn: Function) => fn);

jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
	FRIENDS_LIMIT: 25,
}));

jest.mock("@store/friends", () => {
	const mockSetIsLoadingOnlineFriends = jest.fn();
	const mockSetOnlineFriends = jest.fn();
	const mockSetSearchOnlineFriends = jest.fn();
	const mockSetSearchMyFriends = jest.fn();

	return {
		__esModule: true,
		default: {
			getState: jest.fn(() => ({
				setIsLoadingOnlineFriends: mockSetIsLoadingOnlineFriends,
				setOnlineFriends: mockSetOnlineFriends,
				setSearchOnlineFriends: mockSetSearchOnlineFriends,
				setSearchMyFriends: mockSetSearchMyFriends,
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
				onlineFriends: [
					{
						id: "1",
						firstName: "Test",
						secondName: "",
						thirdName: "User",
						email: "test@test.com",
						phone: "1234567890",
						avatarUrl: "test.jpg",
						avatarCreateDate: "2024-01-01",
						createdAt: "2024-01-01",
					},
				],
				hasMore: true,
				count: 1,
			});
		}
	});
}

describe("OnlineFriendsService", () => {
	let service: OnlineFriendsService;
	let mockRequest: MockRequest;

	beforeEach(() => {
		mockRequest = new MockRequest();
		service = new OnlineFriendsService(mockRequest as unknown as Request, "test-user-id");
		jest.clearAllMocks();
	});

	describe("checkUsers", () => {
		const mockUsers: IUser[] = [
			{
				id: "1",
				firstName: "User",
				secondName: "1",
				thirdName: "",
				email: "user1@test.com",
				phone: "+1234567890",
				avatarUrl: "avatar1.jpg",
				avatarCreateDate: "2024-01-01",
				fullName: "User 1",
			},
			{
				id: "2",
				firstName: "User",
				secondName: "2",
				thirdName: "",
				email: "user2@test.com",
				phone: "+1234567891",
				avatarUrl: "avatar2.jpg",
				avatarCreateDate: "2024-01-01",
				fullName: "User 2",
			},
		];

		it("should make request with user ids when users are provided", () => {
			service.checkUsers(mockUsers);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.checkOnlineUser,
				data: expect.objectContaining({
					ids: [ "1", "2" ],
					userId: "test-user-id",
				}),
			}));
		});

		it("should not make request when users array is empty", () => {
			service.checkUsers([]);
            
			expect(mockRequest.post).not.toHaveBeenCalled();
		});

		it("should set loading state when making request", () => {
			service.checkUsers(mockUsers);
            
			expect(useFriendsStore.getState().setIsLoadingOnlineFriends).toHaveBeenCalledWith(true);
		});

		it("should update store with received data on success", () => {
			service.checkUsers(mockUsers);
            
			expect(useFriendsStore.getState().setOnlineFriends).toHaveBeenCalledWith({
				items: [
					{
						id: "1",
						fullName: "Test User",
						avatarUrl: "test.jpg",
						avatarCreateDate: "2024-01-01",
						createdAt: "2024-01-01",
					},
				],
				hasMore: true,
				count: 1,
			});
		});

		it("should handle empty response data", () => {
			mockRequest.post = jest.fn().mockImplementation((params) => {
				if (params.setLoading) {
					params.setLoading(true);
				}
				if (params.successCb) {
					params.successCb({
						success: true,
						onlineFriends: [],
						hasMore: false,
						count: 0,
					});
				}
			});

			service.checkUsers(mockUsers);
            
			expect(useFriendsStore.getState().setOnlineFriends).toHaveBeenCalledWith({
				items: [],
				hasMore: false,
				count: 0,
			});
		});
	});

	describe("removeUser", () => {
		const mockFriend: IFriend = {
			id: "1",
			fullName: "User 1",
			avatarUrl: "avatar.jpg",
			avatarCreateDate: "2024-01-01",
			createdAt: "2024-01-01",
			newest: false,
		};

		beforeEach(() => {
			service["items"] = [ mockFriend ];
		});

		it("should remove user and update store", () => {
			service.removeUser(mockFriend.id);
            
			expect(service["items"]).toHaveLength(0);
			expect(useFriendsStore.getState().setOnlineFriends).toHaveBeenCalledWith({
				items: [],
				hasMore: true,
				count: 0,
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
            
			expect(useFriendsStore.getState().setOnlineFriends).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
		});
	});

	describe("getAll", () => {
		it("should sync store with current state", () => {
			const mockItems = [ { id: "1" } as IFriend ];
			const mockHasMore = true;
			const mockCount = 1;
            
			service["items"] = mockItems;
			service["hasMore"] = mockHasMore;
			service["count"] = mockCount;
            
			service.getAll();
            
			expect(useFriendsStore.getState().setOnlineFriends).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
		});
	});

	describe("loadMore", () => {
		it("should sync store and resolve", () => {
			const mockItems = [ { id: "1" } as IFriend ];
			const mockHasMore = true;
			const mockCount = 1;
			const resolveMock = jest.fn();
            
			service["items"] = mockItems;
			service["hasMore"] = mockHasMore;
			service["count"] = mockCount;
            
			service.loadMore(resolveMock);
            
			expect(useFriendsStore.getState().setOnlineFriends).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
			expect(resolveMock).toHaveBeenCalled();
		});
	});

	describe("search", () => {
		it("should update search value and trigger debounced search", () => {
			const searchValue = "test";
			service.search(searchValue);
            
			expect(useFriendsStore.getState().setSearchMyFriends).toHaveBeenCalledWith(searchValue);
		});
	});

	describe("_prepareSearch", () => {
		it("should filter items by fullName and update store", () => {
			const mockItems = [
                { id: "1", fullName: "John Doe" } as IFriend,
                { id: "2", fullName: "Jane Smith" } as IFriend,
                { id: "3", fullName: "John Smith" } as IFriend,
			];
            
			service["items"] = mockItems;
			service["searchValue"] = "john";
			service["hasMore"] = true;
			service["count"] = 3;
            
			service["_prepareSearch"]();
            
			expect(useFriendsStore.getState().setOnlineFriends).toHaveBeenCalledWith({
				items: [
					{ id: "1", fullName: "John Doe" },
					{ id: "3", fullName: "John Smith" },
				],
				hasMore: true,
				count: 3,
			});
		});

		it("should handle case-insensitive search", () => {
			const mockItems = [
                { id: "1", fullName: "John Doe" } as IFriend,
                { id: "2", fullName: "JOHN SMITH" } as IFriend,
			];
            
			service["items"] = mockItems;
			service["searchValue"] = "john";
			service["hasMore"] = true;
			service["count"] = 2;
            
			service["_prepareSearch"]();
            
			expect(useFriendsStore.getState().setOnlineFriends).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: true,
				count: 2,
			});
		});

		it("should return empty array when no matches found", () => {
			const mockItems = [
                { id: "1", fullName: "John Doe" } as IFriend,
                { id: "2", fullName: "Jane Smith" } as IFriend,
			];
            
			service["items"] = mockItems;
			service["searchValue"] = "xyz";
			service["hasMore"] = true;
			service["count"] = 2;
            
			service["_prepareSearch"]();
            
			expect(useFriendsStore.getState().setOnlineFriends).toHaveBeenCalledWith({
				items: [],
				hasMore: true,
				count: 2,
			});
		});
	});
});
