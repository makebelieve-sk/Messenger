import type { IUserDetails } from "@custom-types/models.types";
import useUserStore from "../user";

describe("useUserStore", () => {
	test("default state", () => {
		const state = useUserStore.getState();
		expect(state.user).not.toBeUndefined();
		expect(state.userDetails).not.toBeUndefined();
	});

	test("setUser updates user", () => {
		const user = {
			id: "u1",
			firstName: "Alice",
			secondName: "Smith",
			thirdName: "Johnson",
			fullName: "Alice Smith Johnson",
			email: "alice@example.com",
			phone: "+1234567890",
			avatarUrl: "https://example.com/avatar.jpg",
			avatarCreateDate: "2024-01-01T00:00:00Z",
		};
		useUserStore.getState().setUser(user);
		expect(useUserStore.getState().user).toEqual(user);
	});

	test("setLoadingUser updates isUserLoading", () => {
		useUserStore.getState().setLoadingUser(true);
		expect(useUserStore.getState().isUserLoading).toBe(true);
	});

	test("setUserDetails updates userDetails and editUserDetails", () => {
		const userDetails = {
			userId: "u1",
			sex: "female",
			birthday: "1990-01-01",
			city: "New York",
			work: "Developer",
			lastSeen: "2024-01-01T00:00:00Z",
		} as IUserDetails;
		const editUserDetails = {
			sex: "female",
			birthday: "1990-01-01",
			city: "New York",
			work: "Developer",
		};
		useUserStore.getState().setUserDetails({ userDetails, editUserDetails });
		const state = useUserStore.getState();
		expect(state.userDetails).toEqual(userDetails);
	});

	test("setMyAvatar updates myAvatar", () => {
		const avatar = { src: "url", alt: "avatar", userId: "u1" };
		useUserStore.getState().setMyAvatar(avatar);
		expect(useUserStore.getState().myAvatar).toEqual(avatar);
	});

	test("reset restores default state", () => {
		useUserStore.getState().setUser({
			id: "u1",
			firstName: "Alice",
			secondName: "Smith",
			thirdName: "Johnson",
			fullName: "Alice Smith Johnson",
			email: "alice@example.com",
			phone: "+1234567890",
			avatarUrl: "https://example.com/avatar.jpg",
			avatarCreateDate: "2024-01-01T00:00:00Z",
		});
		useUserStore.getState().setUserDetails({
			userDetails: {
				userId: "u1",
				sex: "female",
				birthday: "1990-01-01",
				city: "New York",
				work: "Developer",
				lastSeen: "2024-01-01T00:00:00Z",
			},
			editUserDetails: {
				sex: "female",
				birthday: "1990-01-01",
				city: "New York",
				work: "Developer",
			},
		});
		useUserStore.getState().setMyAvatar({ src: "url", alt: "avatar", userId: "u1" });
		useUserStore.getState().setLoadingUser(true);

		useUserStore.getState().reset();

		const state = useUserStore.getState();
		expect(state.user).not.toBeUndefined();
		expect(state.userDetails).not.toBeUndefined();
	});
});
