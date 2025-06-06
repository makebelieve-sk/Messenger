import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import useFriendsStore from "@store/friends";
import { type IFriend } from "@custom-types/friends.types";
import CommonFriendsService from "../CommonFriendsService";

jest.mock("@utils/debounce", () => (fn: Function) => fn);

jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
	FRIENDS_LIMIT: 25,
}));

jest.mock("@store/friends", () => {
	const mockSetIsLoadingCommonFriends = jest.fn();
	const mockSetCommonFriends = jest.fn();
	const mockSetSearchCommonFriends = jest.fn();

	return {
		__esModule: true,
		default: {
			getState: jest.fn(() => ({
				setIsLoadingCommonFriends: mockSetIsLoadingCommonFriends,
				setCommonFriends: mockSetCommonFriends,
				setSearchCommonFriends: mockSetSearchCommonFriends,
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
				commonFriends: [
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

describe("CommonFriendsService", () => {
	let service: CommonFriendsService;
	let mockRequest: MockRequest;
	const mockUserId = "test-user-id";

	beforeEach(() => {
		mockRequest = new MockRequest();
		service = new CommonFriendsService(mockRequest as unknown as Request, mockUserId);
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
				route: ApiRoutes.getCommonFriends,
				data: expect.objectContaining({
					userId: mockUserId,
				}),
			}));
		});
	});

	describe("loadMore", () => {
		it("should call getMoreByDebounce with correct params", () => {
			const mockResolve = jest.fn();
			service.loadMore(mockResolve);
            
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getCommonFriends,
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
            
			expect(useFriendsStore.getState().setSearchCommonFriends).toHaveBeenCalledWith(searchValue);
			expect(mockRequest.post).toHaveBeenCalledWith(expect.objectContaining({
				route: ApiRoutes.getCommonFriends,
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
            
			expect(useFriendsStore.getState().setCommonFriends).toHaveBeenCalledWith({
				items: mockItems,
				hasMore: mockHasMore,
				count: mockCount,
			});
		});
	});
});
