import { SocketActions } from "common-types";

import ProfilesController from "@core/controllers/ProfilesController";
import Socket from "@core/socket/Socket";
import { validateHandleEvent } from "@core/socket/validation";
import useFriendsStore from "@store/friends";
import useUIStore from "@store/ui";
import { SocketType } from "@custom-types/socket.types";
import { getFriendEntity } from "@utils/friends";
import FriendsController from "../Friends";

jest.mock("@service/Logger", () => ({
	init: jest.fn().mockReturnValue({
		debug: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	}),
}));

jest.mock("@store/friends");
jest.mock("@store/ui");
jest.mock("@utils/friends");
jest.mock("@utils/to-format-socket-ack");
jest.mock("@core/socket/validation");

describe("FriendsController", () => {
	let mockSocket: Socket;
	let mockProfilesController: ProfilesController;
	let eventHandlers: { [key: string]: Function };
	let mockCallback: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		eventHandlers = {};
		mockSocket = {
			on: jest.fn((event, handler) => {
				eventHandlers[event] = handler;
			}),
		} as unknown as Socket;

		mockProfilesController = {
			getProfile: jest.fn().mockReturnValue({
				userService: {
					friendsService: {
						friendsController: {
							incomingRequests: {
								add: jest.fn(),
								remove: jest.fn(),
								syncStore: jest.fn(),
							},
							outgoingRequests: {
								add: jest.fn(),
								remove: jest.fn(),
								syncStore: jest.fn(),
							},
							searchFriends: {
								add: jest.fn(),
								remove: jest.fn(),
								syncStore: jest.fn(),
							},
							followers: {
								add: jest.fn(),
								remove: jest.fn(),
								syncStore: jest.fn(),
							},
							myFriends: {
								add: jest.fn(),
								remove: jest.fn(),
								syncStore: jest.fn(),
							},
							onlineFriends: {
								add: jest.fn(),
								remove: jest.fn(),
								syncStore: jest.fn(),
							},
							blockedUsers: {
								add: jest.fn(),
								remove: jest.fn(),
								syncStore: jest.fn(),
							},
						},
					},
				},
			}),
		} as unknown as ProfilesController;

		(useFriendsStore.getState as jest.Mock).mockReturnValue({
			addFriendsNotification: jest.fn(),
			removeFriendsNotification: jest.fn(),
		});

		(useUIStore.getState as jest.Mock).mockReturnValue({
			setSnackbarError: jest.fn(),
		});

		(getFriendEntity as jest.Mock).mockImplementation((user) => ({
			...user,
			id: user.id,
		}));

		mockCallback = jest.fn();

		(validateHandleEvent as jest.Mock).mockReturnValue({ success: true });

		new FriendsController(mockSocket as unknown as SocketType, mockProfilesController);
	});

	describe("Socket Event Handlers", () => {
		it("should handle FOLLOW_FRIEND event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.FOLLOW_FRIEND]({ user: mockUser }, mockCallback);

			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.incomingRequests.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.incomingRequests.syncStore)
				.toHaveBeenCalled();
			expect(useFriendsStore.getState().addFriendsNotification).toHaveBeenCalled();
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.searchFriends.remove)
				.toHaveBeenCalledWith(mockUser.id);
		});

		it("should handle UNFOLLOW_FRIEND event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.UNFOLLOW_FRIEND]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.incomingRequests.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.followers.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(useFriendsStore.getState().removeFriendsNotification).toHaveBeenCalled();
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.searchFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
		});

		it("should handle ADD_TO_FRIEND event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.ADD_TO_FRIEND]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.outgoingRequests.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
		});

		it("should handle DELETE_FRIEND event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.DELETE_FRIEND]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.outgoingRequests.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
		});

		it("should handle REJECT_FRIEND_REQUEST event", () => {
			const mockUserId = "123";

			eventHandlers[SocketActions.REJECT_FRIEND_REQUEST]({ userId: mockUserId }, mockCallback);

			expect(useUIStore.getState().setSnackbarError)
				.toHaveBeenCalledWith(`Ваша заявка в друзья была отклонена пользователем${mockUserId}`);
		});

		it("should handle ADD_TO_FOLLOWER event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.ADD_TO_FOLLOWER]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.incomingRequests.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(useFriendsStore.getState().removeFriendsNotification).toHaveBeenCalled();
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.followers.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
		});

		it("should handle DELETING_FRIEND event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.DELETING_FRIEND]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.followers.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
		});

		it("should handle BLOCK_FRIEND event", () => {
			const mockUserId = "123";

			eventHandlers[SocketActions.BLOCK_FRIEND]({ userId: mockUserId }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.remove)
				.toHaveBeenCalledWith(mockUserId);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.remove)
				.toHaveBeenCalledWith(mockUserId);
		});

		it("should handle BLOCKING_FRIEND event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.BLOCKING_FRIEND]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.blockedUsers.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
		});

		it("should handle UNBLOCK_FRIEND event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.UNBLOCK_FRIEND]({ user: mockUser }, mockCallback);

			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.searchFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
		});

		it("should handle UNBLOCKING_FRIEND event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.UNBLOCKING_FRIEND]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.blockedUsers.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.searchFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
		});

		it("should handle ADD_OUTGOING_REQUEST event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.ADD_OUTGOING_REQUEST]({ user: mockUser }, mockCallback);

			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.outgoingRequests.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.outgoingRequests.syncStore)
				.toHaveBeenCalled();
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.searchFriends.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.searchFriends.syncStore)
				.toHaveBeenCalled();
		});

		it("should handle REMOVE_OUTGOING_REQUEST event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.REMOVE_OUTGOING_REQUEST]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.outgoingRequests.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.outgoingRequests.syncStore)
				.toHaveBeenCalled();
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.searchFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.searchFriends.syncStore)
				.toHaveBeenCalled();
		});

		it("should handle REMOVE_FOLLOWER event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.REMOVE_FOLLOWER]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.followers.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.followers.syncStore)
				.toHaveBeenCalled();
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.syncStore)
				.toHaveBeenCalled();
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.syncStore)
				.toHaveBeenCalled();
		});

		it("should handle ADD_FRIEND_REQUEST event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.ADD_FRIEND_REQUEST]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.outgoingRequests.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.outgoingRequests.syncStore)
				.toHaveBeenCalled();
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.syncStore)
				.toHaveBeenCalled();
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.syncStore)
				.toHaveBeenCalled();
		});

		it("should handle REMOVE_FRIEND_REQUEST event", () => {
			const mockUser = { id: "123", name: "Test User" };

			eventHandlers[SocketActions.REMOVE_FRIEND_REQUEST]({ user: mockUser }, mockCallback);

			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.incomingRequests.remove)
				.toHaveBeenCalledWith(mockUser.id);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.incomingRequests.syncStore)
				.toHaveBeenCalled();
			expect(useFriendsStore.getState().removeFriendsNotification).toHaveBeenCalled();
			expect(getFriendEntity).toHaveBeenCalledWith(mockUser);
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.myFriends.syncStore)
				.toHaveBeenCalled();
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.add)
				.toHaveBeenCalledWith({ id: "123", name: "Test User" });
			expect(mockProfilesController.getProfile().userService.friendsService.friendsController.onlineFriends.syncStore)
				.toHaveBeenCalled();
		});
	});
});
