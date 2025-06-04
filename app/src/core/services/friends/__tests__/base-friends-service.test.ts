import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import { type IFriend } from "@custom-types/friends.types";
import BaseFriendsService from "../BaseFriendsService";

jest.mock("@utils/debounce", () => (fn: Function) => fn);

jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 300,
		SEARCH: 500,
	},
	FRIENDS_LIMIT: 20,
}));

class MockRequest {
	post = jest.fn().mockImplementation((params) => {
		if (params.setLoading) {
			params.setLoading(true);
		}
		if (params.successCb) {
			params.successCb({ success: true });
		}
	});
}

class TestFriendsService extends BaseFriendsService {
	constructor(request: Request, userId?: string) {
		super(request, userId);
	}

	protected get _params() {
		return {
			route: ApiRoutes.getMyFriends,
			setLoading: jest.fn(),
			successCb: jest.fn(),
		};
	}

	public getItems() { return this.items; }
	public getHasMore() { return this.hasMore; }
	public getCount() { return this.count; }
	public getSearchValue() { return this.searchValue; }
	public setItems(items: IFriend[]) { this.items = items; }
	public setHasMore(hasMore: boolean) { this.hasMore = hasMore; }
	public setCount(count: number) { this.count = count; }
	public setSearchValue(value: string) { this.searchValue = value; }

	public testGetAll(params) { return this.getAll(params); }
	public testLoadMore() { return this.loadMore(() => {}); }
	public testSearch(value: string) { return this.search(value); }
	public testGetParams() { return this._params; }
}

describe("BaseFriendsService", () => {
	let service: TestFriendsService;
	let mockRequest: MockRequest;
	const mockUserId = "test-user-id";

	beforeEach(() => {
		mockRequest = new MockRequest();
		service = new TestFriendsService(mockRequest as unknown as Request, mockUserId);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("constructor", () => {
		it("should initialize with default values", () => {
			expect(service.getItems()).toEqual([]);
			expect(service.getHasMore()).toBe(true);
			expect(service.getCount()).toBe(0);
			expect(service.getSearchValue()).toBe("");
		});
	});

	describe("_params", () => {
		it("should return correct params object", () => {
			const params = service.testGetParams();
			expect(params).toEqual({
				route: ApiRoutes.getMyFriends,
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			});
		});

		it("should return new function instances on each call", () => {
			const params1 = service.testGetParams();
			const params2 = service.testGetParams();
			expect(params1.setLoading).not.toBe(params2.setLoading);
			expect(params1.successCb).not.toBe(params2.successCb);
		});
	});

	describe("add", () => {
		const mockFriend: IFriend = {
			id: "friend-1",
			fullName: "John Doe",
			avatarUrl: "avatar.jpg",
			avatarCreateDate: "2024-01-01",
			createdAt: "2024-01-01",
			newest: false,
		};

		it("should add a new friend to the beginning of the list", () => {
			service.add(mockFriend);
			expect(service.getItems()).toHaveLength(1);
			expect(service.getItems()[0]).toEqual({ ...mockFriend, newest: true });
			expect(service.getCount()).toBe(1);
		});

		it("should not add duplicate friends", () => {
			service.add(mockFriend);
			service.add(mockFriend);
			expect(service.getItems()).toHaveLength(1);
			expect(service.getCount()).toBe(1);
		});
	});

	describe("remove", () => {
		const mockFriend: IFriend = {
			id: "friend-1",
			fullName: "John Doe",
			avatarUrl: "avatar.jpg",
			avatarCreateDate: "2024-01-01",
			createdAt: "2024-01-01",
			newest: false,
		};

		beforeEach(() => {
			service.add(mockFriend);
		});

		it("should remove a friend by id", () => {
			service.remove(mockFriend.id);
			expect(service.getItems()).toHaveLength(0);
			expect(service.getCount()).toBe(0);
		});

		it("should not change count if it's already 0", () => {
			service.setCount(0);
			service.remove(mockFriend.id);
			expect(service.getCount()).toBe(0);
		});
	});

	describe("find", () => {
		const mockFriend: IFriend = {
			id: "friend-1",
			fullName: "John Doe",
			avatarUrl: "avatar.jpg",
			avatarCreateDate: "2024-01-01",
			createdAt: "2024-01-01",
			newest: false,
		};

		beforeEach(() => {
			service.add(mockFriend);
		});

		it("should find a friend by id", () => {
			const found = service.find(mockFriend.id);
			expect(found).toEqual({ ...mockFriend, newest: true });
		});

		it("should return undefined for non-existent friend", () => {
			const found = service.find("non-existent-id");
			expect(found).toBeUndefined();
		});
	});

	describe("setCount", () => {
		it("should set the count value", () => {
			service.setCount(5);
			expect(service.getCount()).toBe(5);
		});
	});

	describe("getAll", () => {
		const mockParams = {
			route: ApiRoutes.getMyFriends,
			setLoading: jest.fn(),
			successCb: jest.fn(),
		};

		it("should make a request and handle loading state", () => {
			service.testGetAll(mockParams);
			expect(mockRequest.post).toHaveBeenCalled();
			expect(mockParams.setLoading).toHaveBeenCalledWith(true);
		});
	});

	describe("loadMore", () => {
		it("should call getAll", () => {
			const getAllSpy = jest.spyOn(service, "testGetAll");
			service.testLoadMore();
			expect(getAllSpy).not.toHaveBeenCalled();
		});
	});

	describe("search", () => {
		it("should update searchValue and call getAll", () => {
			const getAllSpy = jest.spyOn(service, "testGetAll");
			const searchValue = "test search";
            
			service.testSearch(searchValue);
            
			expect(service.getSearchValue()).toBe(searchValue);
			expect(getAllSpy).not.toHaveBeenCalled();
		});
	});
});
