import type Request from "@core/Request";
import BlockedFriendsService from "@core/services/friends/BlockedFriendsService";
import CommonFriendsService from "@core/services/friends/CommonFriendsService";
import FollowersService from "@core/services/friends/FollowersService";
import IncomingRequestsService from "@core/services/friends/IncomingService";
import MyFriendsService from "@core/services/friends/MyFriendsService";
import OnlineFriendsService from "@core/services/friends/OnlineFriendsService";
import OutgoingRequestsService from "@core/services/friends/OutGouingRequestsService";
import SearchService from "@core/services/friends/SearchService";
import FriendsFactoryService from "@core/services/FriendsFactoryService";

jest.mock("@core/services/friends/MyFriendsService");
jest.mock("@core/services/friends/OnlineFriendsService");
jest.mock("@core/services/friends/FollowersService");
jest.mock("@core/services/friends/OutGouingRequestsService");
jest.mock("@core/services/friends/IncomingService");
jest.mock("@core/services/friends/SearchService");
jest.mock("@core/services/friends/BlockedFriendsService");
jest.mock("@core/services/friends/CommonFriendsService");

describe("FriendsFactoryService", () => {
	let requestMock: Request;
	let userId: string;
	let factory: FriendsFactoryService;

	beforeEach(() => {
		requestMock = {
			post: jest.fn(),
			get: jest.fn(),
		} as unknown as Request;
		userId = "test-user-id";
		factory = new FriendsFactoryService(requestMock, userId);
	});

	describe("createFriendsManager", () => {
		it("should create MyFriendsService instance", () => {
			const service = factory.createFriendsManager();
			expect(MyFriendsService).toHaveBeenCalledWith(requestMock, userId);
			expect(service).toBeInstanceOf(MyFriendsService);
		});
	});

	describe("createOnlineFriendsManager", () => {
		it("should create OnlineFriendsService instance", () => {
			const service = factory.createOnlineFriendsManager();
			expect(OnlineFriendsService).toHaveBeenCalledWith(requestMock, userId);
			expect(service).toBeInstanceOf(OnlineFriendsService);
		});
	});

	describe("createFollowersManager", () => {
		it("should create FollowersService instance", () => {
			const service = factory.createFollowersManager();
			expect(FollowersService).toHaveBeenCalledWith(requestMock, userId);
			expect(service).toBeInstanceOf(FollowersService);
		});
	});

	describe("createOutgoingRequestsManager", () => {
		it("should create OutgoingRequestsService instance", () => {
			const service = factory.createOutgoingRequestsManager();
			expect(OutgoingRequestsService).toHaveBeenCalledWith(requestMock);
			expect(service).toBeInstanceOf(OutgoingRequestsService);
		});
	});

	describe("createIncomingRequestsManager", () => {
		it("should create IncomingRequestsService instance", () => {
			const service = factory.createIncomingRequestsManager();
			expect(IncomingRequestsService).toHaveBeenCalledWith(requestMock);
			expect(service).toBeInstanceOf(IncomingRequestsService);
		});
	});

	describe("createSearchService", () => {
		it("should create SearchService instance", () => {
			const service = factory.createSearchService();
			expect(SearchService).toHaveBeenCalledWith(requestMock);
			expect(service).toBeInstanceOf(SearchService);
		});
	});

	describe("createBlockedUsersManager", () => {
		it("should create BlockedFriendsService instance", () => {
			const service = factory.createBlockedUsersManager();
			expect(BlockedFriendsService).toHaveBeenCalledWith(requestMock);
			expect(service).toBeInstanceOf(BlockedFriendsService);
		});
	});

	describe("createCommonFriendsManager", () => {
		it("should create CommonFriendsService instance", () => {
			const service = factory.createCommonFriendsManager();
			expect(CommonFriendsService).toHaveBeenCalledWith(requestMock, userId);
			expect(service).toBeInstanceOf(CommonFriendsService);
		});
	});
});
