import { FriendsTab } from "common-types";
import i18next from "i18next";

import { type IUser } from "@custom-types/models.types";
import { getEmptyText, getFriendEntity } from "@utils/friends";

jest.mock("@store/ui", () => ({
	__esModule: true,
	default: {
		getState: jest.fn(() => ({
			setError: jest.fn(),
		})),
	},
}));

jest.mock("i18next", () => ({
	t: jest.fn((key) => key),
}));

describe("Friends Utils", () => {
	describe("getFriendEntity", () => {
		test("transforms user to friend entity with all fields", () => {
			const user: IUser & { createdAt?: string } = {
				id: "123",
				firstName: "John",
				secondName: "",
				thirdName: "Doe",
				email: "john@example.com",
				phone: "1234567890",
				fullName: "John Doe",
				avatarUrl: "avatar.jpg",
				avatarCreateDate: "2024-01-01",
				createdAt: "2024-01-01",
			};

			const result = getFriendEntity(user);

			expect(result).toEqual({
				id: "123",
				avatarUrl: "avatar.jpg",
				avatarCreateDate: "2024-01-01",
				fullName: "John Doe",
				createdAt: "2024-01-01",
			});
		});

		test("handles missing optional fields", () => {
			const user: IUser & { createdAt?: string } = {
				id: "123",
				firstName: "John",
				secondName: "",
				thirdName: "Doe",
				email: "john@example.com",
				phone: "1234567890",
				fullName: "John Doe",
				avatarUrl: "",
				avatarCreateDate: "",
			};

			const result = getFriendEntity(user);

			expect(result).toEqual({
				id: "123",
				avatarUrl: "",
				avatarCreateDate: "",
				fullName: "John Doe",
				createdAt: "",
			});
		});
	});

	describe("getEmptyText", () => {
		test.each([
			[ FriendsTab.MY, "friends-module.empty.my_friends" ],
			[ FriendsTab.ONLINE, "friends-module.empty.online_friends" ],
			[ FriendsTab.FOLLOWERS, "friends-module.empty.followers" ],
			[ FriendsTab.BLOCKED, "friends-module.empty.blocked" ],
			[ FriendsTab.OUTGOING_REQUESTS, "friends-module.empty.outgoing_requests" ],
			[ FriendsTab.INCOMING_REQUESTS, "friends-module.empty.incoming_requests" ],
			[ FriendsTab.SEARCH, "friends-module.empty.possible_friends" ],
			[ FriendsTab.COMMON, "friends-module.empty.common_friends" ],
		])("returns correct text for tab %s", (tab, expectedText) => {
			const result = getEmptyText(tab);
			expect(result).toBe(expectedText);
			expect(i18next.t).toHaveBeenCalledWith(expectedText);
		});

		test("handles unknown tab and sets error", () => {
			const unknownTab = 999 as FriendsTab;
			const result = getEmptyText(unknownTab);

			expect(result).toBe("friends-module.empty.my_friends");
			expect(i18next.t).toHaveBeenCalledWith("friends-module.error.unknown_tab", { tab: unknownTab });
		});
	});
});
