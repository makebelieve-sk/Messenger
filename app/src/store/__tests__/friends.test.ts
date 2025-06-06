import { FriendsTab } from "common-types";

import { type IFriend } from "@custom-types/friends.types";
import useFriendsStore from "../friends";

describe("useFriendsStore", () => {
	beforeEach(() => {
		useFriendsStore.getState().reset();
	});

	describe("Tab Management", () => {
		test("should set main tab", () => {
			useFriendsStore.getState().setMainTab(FriendsTab.INCOMING_REQUESTS);
			expect(useFriendsStore.getState().mainTab).toBe(FriendsTab.INCOMING_REQUESTS);
		});

		test("should set content tab", () => {
			useFriendsStore.getState().setContentTab(FriendsTab.MY);
			expect(useFriendsStore.getState().contentTab).toBe(FriendsTab.MY);
		});
	});

	describe("Friends Notification", () => {
		test("should set friends notification count", () => {
			useFriendsStore.getState().setFriendsNotification(5);
			expect(useFriendsStore.getState().friendsNotification).toBe(5);
		});

		test("should add to friends notification count", () => {
			useFriendsStore.getState().setFriendsNotification(2);
			useFriendsStore.getState().addFriendsNotification();
			expect(useFriendsStore.getState().friendsNotification).toBe(3);
		});

		test("should remove from friends notification count", () => {
			useFriendsStore.getState().setFriendsNotification(3);
			useFriendsStore.getState().removeFriendsNotification();
			expect(useFriendsStore.getState().friendsNotification).toBe(2);
		});

		test("should not go below 0 when removing notifications", () => {
			useFriendsStore.getState().setFriendsNotification(0);
			useFriendsStore.getState().removeFriendsNotification();
			expect(useFriendsStore.getState().friendsNotification).toBe(0);
		});
	});

	describe("Search Friends Management", () => {
		const mockFriends: IFriend[] = [
			{
				id: "1",
				fullName: "John Doe Smith",
				avatarUrl: "https://example.com/avatar1.jpg",
				avatarCreateDate: "2024-01-01T00:00:00Z",
				createdAt: "2024-01-01T00:00:00Z",
			},
		];

		test("should set possible friends", () => {
			useFriendsStore.getState().setPossibleFriends({
				items: mockFriends,
				count: 1,
				hasMore: true,
			});
			expect(useFriendsStore.getState().searchFriends).toEqual(mockFriends);
			expect(useFriendsStore.getState().countSearchFriends).toBe(1);
			expect(useFriendsStore.getState().hasMoreSearchFriends).toBe(true);
		});

		test("should set loading states", () => {
			useFriendsStore.getState().setIsLoadingPossibleFriends(true);
			expect(useFriendsStore.getState().isLoadingPossibleFriends).toBe(true);

			useFriendsStore.getState().setIsLoadingFollowAction(true);
			expect(useFriendsStore.getState().isLoadingFollowAction).toBe(true);
		});

		test("should set search query", () => {
			useFriendsStore.getState().setSearchPossibleFriends("John");
			expect(useFriendsStore.getState().searchPossibleFriends).toBe("John");
		});
	});

	describe("Incoming Requests Management", () => {
		const mockRequests: IFriend[] = [
			{
				id: "2",
				fullName: "Jane Smith Johnson",
				avatarUrl: "https://example.com/avatar2.jpg",
				avatarCreateDate: "2024-01-02T00:00:00Z",
				createdAt: "2024-01-02T00:00:00Z",
			},
		];

		test("should set incoming requests", () => {
			useFriendsStore.getState().setIncomingRequests({
				items: mockRequests,
				count: 1,
				hasMore: false,
			});
			expect(useFriendsStore.getState().incomingRequests).toEqual(mockRequests);
			expect(useFriendsStore.getState().countIncomingRequests).toBe(1);
			expect(useFriendsStore.getState().hasMoreIncomingRequests).toBe(false);
		});

		test("should set loading states", () => {
			useFriendsStore.getState().setIsLoadingIncomingRequests(true);
			expect(useFriendsStore.getState().isLoadingIncomingRequests).toBe(true);

			useFriendsStore.getState().setIsLoadingAcceptAction(true);
			expect(useFriendsStore.getState().isLoadingAcceptAction).toBe(true);
		});
	});

	describe("My Friends Management", () => {
		const mockFriends: IFriend[] = [
			{
				id: "3",
				fullName: "Bob Wilson Brown",
				avatarUrl: "https://example.com/avatar3.jpg",
				avatarCreateDate: "2024-01-03T00:00:00Z",
				createdAt: "2024-01-03T00:00:00Z",
			},
		];

		test("should set my friends", () => {
			useFriendsStore.getState().setMyFriends({
				items: mockFriends,
				count: 1,
				hasMore: true,
			});
			expect(useFriendsStore.getState().myFriends).toEqual(mockFriends);
			expect(useFriendsStore.getState().countMyFriends).toBe(1);
			expect(useFriendsStore.getState().hasMoreMyFriends).toBe(true);
		});

		test("should set loading states", () => {
			useFriendsStore.getState().setIsLoadingMyFriends(true);
			expect(useFriendsStore.getState().isLoadingMyFriends).toBe(true);

			useFriendsStore.getState().setIsLoadingDeleteFriendAction(true);
			expect(useFriendsStore.getState().isLoadingDeleteFriendAction).toBe(true);
		});
	});

	describe("Blocked Friends Management", () => {
		const mockBlocked: IFriend[] = [
			{
				id: "4",
				fullName: "Alice Cooper Davis",
				avatarUrl: "https://example.com/avatar4.jpg",
				avatarCreateDate: "2024-01-04T00:00:00Z",
				createdAt: "2024-01-04T00:00:00Z",
			},
		];

		test("should set blocked friends", () => {
			useFriendsStore.getState().setBlockedFriends({
				items: mockBlocked,
				count: 1,
				hasMore: false,
			});
			expect(useFriendsStore.getState().blockedFriends).toEqual(mockBlocked);
			expect(useFriendsStore.getState().countBlockedFriends).toBe(1);
			expect(useFriendsStore.getState().hasMoreBlockedFriends).toBe(false);
		});

		test("should set loading states", () => {
			useFriendsStore.getState().setIsLoadingBlockFriends(true);
			expect(useFriendsStore.getState().isLoadingBlockedFriends).toBe(true);

			useFriendsStore.getState().setIsLoadingUnblockAction(true);
			expect(useFriendsStore.getState().isLoadingUnblockAction).toBe(true);
		});
	});

	describe("Common Friends Management", () => {
		const mockCommon: IFriend[] = [
			{
				id: "5",
				fullName: "Charlie Taylor Anderson",
				avatarUrl: "https://example.com/avatar5.jpg",
				avatarCreateDate: "2024-01-05T00:00:00Z",
				createdAt: "2024-01-05T00:00:00Z",
			},
		];

		test("should set common friends", () => {
			useFriendsStore.getState().setCommonFriends({
				items: mockCommon,
				count: 1,
				hasMore: true,
			});
			expect(useFriendsStore.getState().commonFriends).toEqual(mockCommon);
			expect(useFriendsStore.getState().countCommonFriends).toBe(1);
			expect(useFriendsStore.getState().hasMoreCommonFriends).toBe(true);
		});

		test("should set loading state", () => {
			useFriendsStore.getState().setIsLoadingCommonFriends(true);
			expect(useFriendsStore.getState().isLoadingCommonFriends).toBe(true);
		});
	});

	describe("Online Friends Management", () => {
		const mockOnline: IFriend[] = [
			{
				id: "6",
				fullName: "David Miller White",
				avatarUrl: "https://example.com/avatar6.jpg",
				avatarCreateDate: "2024-01-06T00:00:00Z",
				createdAt: "2024-01-06T00:00:00Z",
			},
		];

		test("should set online friends", () => {
			useFriendsStore.getState().setOnlineFriends({
				items: mockOnline,
				count: 1,
				hasMore: false,
			});
			expect(useFriendsStore.getState().onlineFriends).toEqual(mockOnline);
			expect(useFriendsStore.getState().countOnlineFriends).toBe(1);
			expect(useFriendsStore.getState().hasMoreOnlineFriends).toBe(false);
		});

		test("should set loading state", () => {
			useFriendsStore.getState().setIsLoadingOnlineFriends(true);
			expect(useFriendsStore.getState().isLoadingOnlineFriends).toBe(true);
		});
	});

	describe("Outgoing Requests Management", () => {
		const mockOutgoing: IFriend[] = [
			{
				id: "7",
				fullName: "Emma Wilson Clark",
				avatarUrl: "https://example.com/avatar7.jpg",
				avatarCreateDate: "2024-01-07T00:00:00Z",
				createdAt: "2024-01-07T00:00:00Z",
			},
		];

		test("should set outgoing requests", () => {
			useFriendsStore.getState().setOutgoingRequests({
				items: mockOutgoing,
				count: 1,
				hasMore: true,
			});
			expect(useFriendsStore.getState().outgoingRequests).toEqual(mockOutgoing);
			expect(useFriendsStore.getState().countOutgoingRequests).toBe(1);
			expect(useFriendsStore.getState().hasMoreOutgoingRequests).toBe(true);
		});

		test("should set loading states", () => {
			useFriendsStore.getState().setIsLoadingOutgoingRequests(true);
			expect(useFriendsStore.getState().isLoadingOutgoingRequests).toBe(true);

			useFriendsStore.getState().setIsLoadingUnfollowAction(true);
			expect(useFriendsStore.getState().isLoadingUnfollowAction).toBe(true);
		});

		test("should set search query", () => {
			useFriendsStore.getState().setSearchOutgoingRequests("Emma");
			expect(useFriendsStore.getState().searchOutgoingRequests).toBe("Emma");
		});
	});

	describe("Followers Management", () => {
		const mockFollowers: IFriend[] = [
			{
				id: "8",
				fullName: "Frank Brown Lee",
				avatarUrl: "https://example.com/avatar8.jpg",
				avatarCreateDate: "2024-01-08T00:00:00Z",
				createdAt: "2024-01-08T00:00:00Z",
			},
		];

		test("should set followers", () => {
			useFriendsStore.getState().setFollowers({
				items: mockFollowers,
				count: 1,
				hasMore: false,
			});
			expect(useFriendsStore.getState().followers).toEqual(mockFollowers);
			expect(useFriendsStore.getState().countFollowers).toBe(1);
			expect(useFriendsStore.getState().hasMoreFollowers).toBe(false);
		});

		test("should set loading states", () => {
			useFriendsStore.getState().setIsLoadingFollowers(true);
			expect(useFriendsStore.getState().isLoadingFollowers).toBe(true);

			useFriendsStore.getState().setIsLoadingAddFriendAction(true);
			expect(useFriendsStore.getState().isLoadingAddFriendAction).toBe(true);
		});

		test("should set search query", () => {
			useFriendsStore.getState().setSearchFollowers("Frank");
			expect(useFriendsStore.getState().searchFollowers).toBe("Frank");
		});
	});

	describe("Search Functionality", () => {
		test("should set search queries for different sections", () => {
			useFriendsStore.getState().setSearchIncomingRequests("John");
			expect(useFriendsStore.getState().searchIncomingRequests).toBe("John");

			useFriendsStore.getState().setSearchMyFriends("Alice");
			expect(useFriendsStore.getState().searchMyFriends).toBe("Alice");

			useFriendsStore.getState().setSearchBlockedFriends("Bob");
			expect(useFriendsStore.getState().searchBlockedFriends).toBe("Bob");

			useFriendsStore.getState().setSearchCommonFriends("Charlie");
			expect(useFriendsStore.getState().searchCommonFriends).toBe("Charlie");

			useFriendsStore.getState().setSearchOnlineFriends("David");
			expect(useFriendsStore.getState().searchOnlineFriends).toBe("David");
		});
	});

	describe("All Counts Management", () => {
		test("should set all counts at once", () => {
			const counts = {
				countSearchFriends: 5,
				countIncomingRequests: 3,
				countOutgoingRequests: 2,
				countMyFriends: 10,
				countFollowers: 7,
				countBlockedFriends: 1,
				countCommonFriends: 4,
			};

			useFriendsStore.getState().setAllCounts(counts);

			expect(useFriendsStore.getState().countSearchFriends).toBe(5);
			expect(useFriendsStore.getState().countIncomingRequests).toBe(3);
			expect(useFriendsStore.getState().countOutgoingRequests).toBe(2);
			expect(useFriendsStore.getState().countMyFriends).toBe(10);
			expect(useFriendsStore.getState().countFollowers).toBe(7);
			expect(useFriendsStore.getState().countBlockedFriends).toBe(1);
			expect(useFriendsStore.getState().countCommonFriends).toBe(4);
		});
	});

	describe("Reset Functionality", () => {
		test("should reset all state to initial values", () => {
			useFriendsStore.getState().setMainTab(FriendsTab.INCOMING_REQUESTS);
			useFriendsStore.getState().setFriendsNotification(5);
			useFriendsStore.getState().setIsLoadingPossibleFriends(true);

			useFriendsStore.getState().reset();

			expect(useFriendsStore.getState().mainTab).toBe(FriendsTab.ALL);
			expect(useFriendsStore.getState().friendsNotification).toBe(0);
			expect(useFriendsStore.getState().isLoadingPossibleFriends).toBe(false);
		});
	});
});
