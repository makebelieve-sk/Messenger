import { FriendsTab } from "common-types";

import FriendsController from "@core/controllers/FriendsController";
import type Request from "@core/Request";
import FriendsFactoryService from "@core/services/FriendsFactoryService";
import { type IUser } from "@custom-types/models.types";
import useFriendsStore from "../../../__mocks__/@store/friends";
import FriendsService from "../FriendsService";

jest.mock("@core/controllers/FriendsController");
jest.mock("@core/services/FriendsFactoryService");
jest.mock("@store/friends");

describe("FriendsService", () => {
	let requestMock: Request;
	let userId: string;
	let service: FriendsService;
	let mockFriendsController: jest.Mocked<FriendsController>;
	let mockFactory: jest.Mocked<FriendsFactoryService>;
	let mockGetAllCounts: jest.Mock;

	beforeEach(() => {
		requestMock = {
			post: jest.fn(),
			get: jest.fn(),
		} as unknown as Request;
		userId = "test-user-id";

		mockFriendsController = {
			getFriends: jest.fn(),
			loadMore: jest.fn(),
			search: jest.fn(),
			onlineFriends: {
				checkUsers: jest.fn(),
				removeUser: jest.fn(),
			},
			searchFriends: {
				follow: jest.fn(),
				add: jest.fn(),
				syncStore: jest.fn(),
				setCount: jest.fn(),
			},
			outgoingRequests: {
				add: jest.fn(),
				syncStore: jest.fn(),
				unfollow: jest.fn(),
				setCount: jest.fn(),
			},
			myFriends: {
				deleteFriend: jest.fn(),
				add: jest.fn(),
				syncStore: jest.fn(),
				blockFriend: jest.fn(),
				writeMessage: jest.fn(),
				setCount: jest.fn(),
			},
			followers: {
				add: jest.fn(),
				syncStore: jest.fn(),
				addFriend: jest.fn(),
				setCount: jest.fn(),
			},
			incomingRequests: {
				accept: jest.fn(),
				leftInFollowers: jest.fn(),
				setCount: jest.fn(),
			},
			blockedUsers: {
				add: jest.fn(),
				syncStore: jest.fn(),
				unblock: jest.fn(),
				setCount: jest.fn(),
			},
			commonFriends: {
				setCount: jest.fn(),
			},
		} as unknown as jest.Mocked<FriendsController>;

		mockFactory = {
			createFriendsManager: jest.fn(),
			createOnlineFriendsManager: jest.fn(),
			createFollowersManager: jest.fn(),
			createOutgoingRequestsManager: jest.fn(),
			createIncomingRequestsManager: jest.fn(),
			createSearchService: jest.fn(),
			createBlockedUsersManager: jest.fn(),
			createCommonFriendsManager: jest.fn(),
		} as unknown as jest.Mocked<FriendsFactoryService>;

		mockGetAllCounts = jest.fn();
		const mockSetAllCounts = jest.fn();
		(useFriendsStore.getState as jest.Mock).mockReturnValue({
			getAllCounts: mockGetAllCounts,
			setAllCounts: mockSetAllCounts,
		});

		(FriendsFactoryService as jest.Mock).mockImplementation(() => mockFactory);
		(FriendsController as jest.Mock).mockImplementation(() => mockFriendsController);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		jest.spyOn(FriendsService.prototype as any, "_getAllCounts").mockImplementation(() => {
			mockGetAllCounts();
			const mockData = {
				countMyFriends: 5,
				countFollowers: 3,
				countOutgoingRequests: 2,
				countIncomingRequests: 1,
				countSearchFriends: 10,
				countBlockedFriends: 0,
				countCommonFriends: 2,
			};
			mockFriendsController.myFriends.setCount(mockData.countMyFriends);
			mockFriendsController.followers.setCount(mockData.countFollowers);
			mockFriendsController.outgoingRequests.setCount(mockData.countOutgoingRequests);
			mockFriendsController.incomingRequests.setCount(mockData.countIncomingRequests);
			mockFriendsController.searchFriends.setCount(mockData.countSearchFriends);
			mockFriendsController.blockedUsers.setCount(mockData.countBlockedFriends);
			mockFriendsController.commonFriends.setCount(mockData.countCommonFriends);
			mockSetAllCounts(mockData);
		});

		service = new FriendsService(requestMock, userId);
	});

	describe("constructor", () => {
		it("should initialize with correct dependencies", () => {
			expect(FriendsFactoryService).toHaveBeenCalledWith(requestMock, userId);
			expect(FriendsController).toHaveBeenCalled();
		});

		it("should create all required services through factory", () => {
			expect(mockFactory.createFriendsManager).toHaveBeenCalled();
			expect(mockFactory.createOnlineFriendsManager).toHaveBeenCalled();
			expect(mockFactory.createFollowersManager).toHaveBeenCalled();
			expect(mockFactory.createOutgoingRequestsManager).toHaveBeenCalled();
			expect(mockFactory.createIncomingRequestsManager).toHaveBeenCalled();
			expect(mockFactory.createSearchService).toHaveBeenCalled();
			expect(mockFactory.createBlockedUsersManager).toHaveBeenCalled();
			expect(mockFactory.createCommonFriendsManager).toHaveBeenCalled();
		});

		it("should call getAllCounts during initialization", () => {
			expect(mockGetAllCounts).toHaveBeenCalled();
		});

		it("should set all counts during initialization", () => {
			expect(mockFriendsController.myFriends.setCount).toHaveBeenCalledWith(5);
			expect(mockFriendsController.followers.setCount).toHaveBeenCalledWith(3);
			expect(mockFriendsController.outgoingRequests.setCount).toHaveBeenCalledWith(2);
			expect(mockFriendsController.incomingRequests.setCount).toHaveBeenCalledWith(1);
			expect(mockFriendsController.searchFriends.setCount).toHaveBeenCalledWith(10);
			expect(mockFriendsController.blockedUsers.setCount).toHaveBeenCalledWith(0);
			expect(mockFriendsController.commonFriends.setCount).toHaveBeenCalledWith(2);
		});
	});

	describe("friendsController", () => {
		it("should return the friends controller instance", () => {
			expect(service.friendsController).toBe(mockFriendsController);
		});
	});

	describe("getFriends", () => {
		it("should call friendsController.getFriends with correct tab", () => {
			service.getFriends(FriendsTab.MY);
			expect(mockFriendsController.getFriends).toHaveBeenCalledWith(FriendsTab.MY);
		});

		it("should handle different friend tabs", () => {
			service.getFriends(FriendsTab.FOLLOWERS);
			expect(mockFriendsController.getFriends).toHaveBeenCalledWith(FriendsTab.FOLLOWERS);

			service.getFriends(FriendsTab.OUTGOING_REQUESTS);
			expect(mockFriendsController.getFriends).toHaveBeenCalledWith(FriendsTab.OUTGOING_REQUESTS);

			service.getFriends(FriendsTab.INCOMING_REQUESTS);
			expect(mockFriendsController.getFriends).toHaveBeenCalledWith(FriendsTab.INCOMING_REQUESTS);
		});
	});

	describe("checkOnlineUsers", () => {
		it("should call onlineFriends.checkUsers with provided users", () => {
			const onlineUsers = [ { id: "user1" }, { id: "user2" } ] as IUser[];

			service.checkOnlineUsers(onlineUsers);
			expect(mockFriendsController.onlineFriends.checkUsers).toHaveBeenCalledWith(onlineUsers);
		});

		it("should handle empty online users array", () => {
			service.checkOnlineUsers([]);
			expect(mockFriendsController.onlineFriends.checkUsers).toHaveBeenCalledWith([]);
		});
	});

	describe("loadMore", () => {
		it("should call friendsController.loadMore with correct parameters", () => {
			const resolve = jest.fn();

			service.loadMore(FriendsTab.MY, resolve);
			expect(mockFriendsController.loadMore).toHaveBeenCalledWith(FriendsTab.MY, resolve);
		});

		it("should handle different friend tabs when loading more", () => {
			const resolve = jest.fn();

			service.loadMore(FriendsTab.FOLLOWERS, resolve);
			expect(mockFriendsController.loadMore).toHaveBeenCalledWith(FriendsTab.FOLLOWERS, resolve);

			service.loadMore(FriendsTab.OUTGOING_REQUESTS, resolve);
			expect(mockFriendsController.loadMore).toHaveBeenCalledWith(FriendsTab.OUTGOING_REQUESTS, resolve);

			service.loadMore(FriendsTab.INCOMING_REQUESTS, resolve);
			expect(mockFriendsController.loadMore).toHaveBeenCalledWith(FriendsTab.INCOMING_REQUESTS, resolve);
		});
	});

	describe("followFriend", () => {
		it("should call searchFriends.follow and handle success callback", () => {
			const friendId = "friend-123";
			const friend = { id: friendId, name: "Test Friend" };
            
			(mockFriendsController.searchFriends.follow as jest.Mock).mockImplementation((id, callback) => callback(friend));

			service.followFriend(friendId);

			expect(mockFriendsController.searchFriends.follow).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.outgoingRequests.add).toHaveBeenCalledWith(friend);
			expect(mockFriendsController.outgoingRequests.syncStore).toHaveBeenCalled();
		});

		it("should handle follow failure gracefully", () => {
			const friendId = "friend-123";
            
			(mockFriendsController.searchFriends.follow as jest.Mock).mockImplementation(() => {});

			service.followFriend(friendId);

			expect(mockFriendsController.searchFriends.follow).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.outgoingRequests.add).not.toHaveBeenCalled();
			expect(mockFriendsController.outgoingRequests.syncStore).not.toHaveBeenCalled();
		});
	});

	describe("deleteFriend", () => {
		it("should call myFriends.deleteFriend and handle success callback", () => {
			const friendId = "friend-123";
			const friend = { id: friendId, name: "Test Friend" };
            
			(mockFriendsController.myFriends.deleteFriend as jest.Mock).mockImplementation((id, callback) => callback(friend));

			service.deleteFriend(friendId);

			expect(mockFriendsController.myFriends.deleteFriend).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.followers.add).toHaveBeenCalledWith(friend);
			expect(mockFriendsController.followers.syncStore).toHaveBeenCalled();
			expect(mockFriendsController.onlineFriends.removeUser).toHaveBeenCalledWith(friendId);
		});

		it("should handle delete failure gracefully", () => {
			const friendId = "friend-123";
            
			(mockFriendsController.myFriends.deleteFriend as jest.Mock).mockImplementation(() => {});

			service.deleteFriend(friendId);

			expect(mockFriendsController.myFriends.deleteFriend).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.followers.add).not.toHaveBeenCalled();
			expect(mockFriendsController.followers.syncStore).not.toHaveBeenCalled();
			expect(mockFriendsController.onlineFriends.removeUser).not.toHaveBeenCalled();
		});
	});

	describe("accept", () => {
		it("should call incomingRequests.accept and handle success callback", () => {
			const friendId = "friend-123";
			const friend = { id: friendId, name: "Test Friend" };
            
			(mockFriendsController.incomingRequests.accept as jest.Mock).mockImplementation((id, callback) => callback(friend));

			service.accept(friendId);

			expect(mockFriendsController.incomingRequests.accept).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.myFriends.add).toHaveBeenCalledWith(friend);
			expect(mockFriendsController.myFriends.syncStore).toHaveBeenCalled();
		});

		it("should handle accept failure gracefully", () => {
			const friendId = "friend-123";
            
			(mockFriendsController.incomingRequests.accept as jest.Mock).mockImplementation(() => {});

			service.accept(friendId);

			expect(mockFriendsController.incomingRequests.accept).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.myFriends.add).not.toHaveBeenCalled();
			expect(mockFriendsController.myFriends.syncStore).not.toHaveBeenCalled();
		});
	});

	describe("blockFriend", () => {
		it("should call myFriends.blockFriend and handle success callback", () => {
			const friendId = "friend-123";
			const friend = { id: friendId, name: "Test Friend" };
            
			(mockFriendsController.myFriends.blockFriend as jest.Mock).mockImplementation((id, callback) => callback(friend));

			service.blockFriend(friendId);

			expect(mockFriendsController.myFriends.blockFriend).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.blockedUsers.add).toHaveBeenCalledWith(friend);
			expect(mockFriendsController.blockedUsers.syncStore).toHaveBeenCalled();
			expect(mockFriendsController.onlineFriends.removeUser).toHaveBeenCalledWith(friendId);
		});

		it("should handle block failure gracefully", () => {
			const friendId = "friend-123";
            
			(mockFriendsController.myFriends.blockFriend as jest.Mock).mockImplementation(() => {});

			service.blockFriend(friendId);

			expect(mockFriendsController.myFriends.blockFriend).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.blockedUsers.add).not.toHaveBeenCalled();
			expect(mockFriendsController.blockedUsers.syncStore).not.toHaveBeenCalled();
			expect(mockFriendsController.onlineFriends.removeUser).not.toHaveBeenCalled();
		});
	});

	describe("unblock", () => {
		it("should call blockedUsers.unblock and handle success callback", () => {
			const friendId = "friend-123";
			const friend = { id: friendId, name: "Test Friend" };
            
			(mockFriendsController.blockedUsers.unblock as jest.Mock).mockImplementation((id, callback) => callback(friend));

			service.unblock(friendId);

			expect(mockFriendsController.blockedUsers.unblock).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.searchFriends.add).toHaveBeenCalledWith(friend);
			expect(mockFriendsController.searchFriends.syncStore).toHaveBeenCalled();
		});

		it("should handle unblock failure gracefully", () => {
			const friendId = "friend-123";
            
			(mockFriendsController.blockedUsers.unblock as jest.Mock).mockImplementation(() => {});

			service.unblock(friendId);

			expect(mockFriendsController.blockedUsers.unblock).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.searchFriends.add).not.toHaveBeenCalled();
			expect(mockFriendsController.searchFriends.syncStore).not.toHaveBeenCalled();
		});
	});

	describe("addFriend", () => {
		it("should call followers.addFriend and handle success callback", () => {
			const friendId = "friend-123";
			const friend = { id: friendId, name: "Test Friend" };
            
			(mockFriendsController.followers.addFriend as jest.Mock).mockImplementation((id, callback) => callback(friend));

			service.addFriend(friendId);

			expect(mockFriendsController.followers.addFriend).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.myFriends.add).toHaveBeenCalledWith(friend);
			expect(mockFriendsController.myFriends.syncStore).toHaveBeenCalled();
		});

		it("should handle addFriend failure gracefully", () => {
			const friendId = "friend-123";
            
			(mockFriendsController.followers.addFriend as jest.Mock).mockImplementation(() => {});

			service.addFriend(friendId);

			expect(mockFriendsController.followers.addFriend).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.myFriends.add).not.toHaveBeenCalled();
			expect(mockFriendsController.myFriends.syncStore).not.toHaveBeenCalled();
		});
	});

	describe("leftInFollowers", () => {
		it("should call incomingRequests.leftInFollowers and handle success callback", () => {
			const friendId = "friend-123";
			const friend = { id: friendId, name: "Test Friend" };
            
			(mockFriendsController.incomingRequests.leftInFollowers as jest.Mock).mockImplementation((id, callback) => callback(friend));

			service.leftInFollowers(friendId);

			expect(mockFriendsController.incomingRequests.leftInFollowers).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.followers.add).toHaveBeenCalledWith(friend);
			expect(mockFriendsController.followers.syncStore).toHaveBeenCalled();
		});

		it("should handle leftInFollowers failure gracefully", () => {
			const friendId = "friend-123";
            
			(mockFriendsController.incomingRequests.leftInFollowers as jest.Mock).mockImplementation(() => {});

			service.leftInFollowers(friendId);

			expect(mockFriendsController.incomingRequests.leftInFollowers).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.followers.add).not.toHaveBeenCalled();
			expect(mockFriendsController.followers.syncStore).not.toHaveBeenCalled();
		});
	});

	describe("unfollow", () => {
		it("should call outgoingRequests.unfollow and handle success callback", () => {
			const friendId = "friend-123";
			const friend = { id: friendId, name: "Test Friend" };
            
			(mockFriendsController.outgoingRequests.unfollow as jest.Mock).mockImplementation((id, callback) => callback(friend));

			service.unfollow(friendId);

			expect(mockFriendsController.outgoingRequests.unfollow).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.searchFriends.add).toHaveBeenCalledWith(friend);
			expect(mockFriendsController.searchFriends.syncStore).toHaveBeenCalled();
		});

		it("should handle unfollow failure gracefully", () => {
			const friendId = "friend-123";
            
			(mockFriendsController.outgoingRequests.unfollow as jest.Mock).mockImplementation(() => {});

			service.unfollow(friendId);

			expect(mockFriendsController.outgoingRequests.unfollow).toHaveBeenCalledWith(
				friendId,
				expect.any(Function),
			);
			expect(mockFriendsController.searchFriends.add).not.toHaveBeenCalled();
			expect(mockFriendsController.searchFriends.syncStore).not.toHaveBeenCalled();
		});
	});

	describe("removeOnlineUser", () => {
		it("should call onlineFriends.removeUser with correct userId", () => {
			const userId = "user-123";
			service.removeOnlineUser(userId);
			expect(mockFriendsController.onlineFriends.removeUser).toHaveBeenCalledWith(userId);
		});
	});

	describe("search", () => {
		it("should call friendsController.search with correct parameters", () => {
			const type = FriendsTab.SEARCH;
			const value = "test search";
			service.search(type, value);
			expect(mockFriendsController.search).toHaveBeenCalledWith(type, value);
		});
	});

	describe("writeMessage", () => {
		it("should call myFriends.writeMessage with correct friendId", () => {
			const friendId = "friend-123";
			service.writeMessage(friendId);
			expect(mockFriendsController.myFriends.writeMessage).toHaveBeenCalledWith(friendId);
		});
	});
});
