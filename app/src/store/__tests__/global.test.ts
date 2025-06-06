import { Pages } from "@custom-types/enums";
import useGlobalStore from "../global";

describe("useGlobalStore", () => {
	test("addOnlineUsers adds a user to the map", () => {
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
		useGlobalStore.getState().addOnlineUsers(user);
		const state = useGlobalStore.getState();
		expect(state.onlineUsers.size).toBe(1);
	});

	test("reset restores default state", () => {
		useGlobalStore.getState().setRedirectTo(Pages.aboutUs);
		useGlobalStore.getState().addOnlineUsers({
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

		useGlobalStore.getState().reset();

		const state = useGlobalStore.getState();
		expect(state.redirectTo).toBe(Pages.signIn);
		expect(state.onlineUsers.size).toBe(0);
	});

	test("reset clears all online users", () => {
		const user1 = {
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
		const user2 = {
			id: "u2",
			firstName: "Bob",
			secondName: "Brown",
			thirdName: "Davis",
			fullName: "Bob Brown Davis",
			email: "bob@example.com",
			phone: "+0987654321",
			avatarUrl: "https://example.com/avatar2.jpg",
			avatarCreateDate: "2024-01-02T00:00:00Z",
		};

		useGlobalStore.getState().addOnlineUsers(user1);
		useGlobalStore.getState().addOnlineUsers(user2);
		expect(useGlobalStore.getState().onlineUsers.size).toBe(2);

		useGlobalStore.getState().reset();
		expect(useGlobalStore.getState().onlineUsers.size).toBe(0);
	});

	test("reset restores redirectTo to signIn page", () => {
		const pages = [ Pages.aboutUs, Pages.profile, Pages.photos ];
		
		for (const page of pages) {
			useGlobalStore.getState().setRedirectTo(page);
			useGlobalStore.getState().reset();
			expect(useGlobalStore.getState().redirectTo).toBe(Pages.signIn);
		}
	});

	test("setOnlineUsers replaces all online users", () => {
		const initialUsers = [
			{
				id: "u1",
				firstName: "Alice",
				secondName: "Smith",
				thirdName: "Johnson",
				fullName: "Alice Smith Johnson",
				email: "alice@example.com",
				phone: "+1234567890",
				avatarUrl: "https://example.com/avatar.jpg",
				avatarCreateDate: "2024-01-01T00:00:00Z",
			},
			{
				id: "u2",
				firstName: "Bob",
				secondName: "Brown",
				thirdName: "Davis",
				fullName: "Bob Brown Davis",
				email: "bob@example.com",
				phone: "+0987654321",
				avatarUrl: "https://example.com/avatar2.jpg",
				avatarCreateDate: "2024-01-02T00:00:00Z",
			},
		];

		useGlobalStore.getState().setOnlineUsers(initialUsers);
		expect(useGlobalStore.getState().onlineUsers.size).toBe(2);
		expect(useGlobalStore.getState().onlineUsers.get("u1")).toEqual(initialUsers[0]);
		expect(useGlobalStore.getState().onlineUsers.get("u2")).toEqual(initialUsers[1]);

		const newUsers = [
			{
				id: "u3",
				firstName: "Charlie",
				secondName: "Wilson",
				thirdName: "Taylor",
				fullName: "Charlie Wilson Taylor",
				email: "charlie@example.com",
				phone: "+1122334455",
				avatarUrl: "https://example.com/avatar3.jpg",
				avatarCreateDate: "2024-01-03T00:00:00Z",
			},
		];

		useGlobalStore.getState().setOnlineUsers(newUsers);
		expect(useGlobalStore.getState().onlineUsers.size).toBe(1);
		expect(useGlobalStore.getState().onlineUsers.get("u3")).toEqual(newUsers[0]);
		expect(useGlobalStore.getState().onlineUsers.get("u1")).toBeUndefined();
		expect(useGlobalStore.getState().onlineUsers.get("u2")).toBeUndefined();
	});

	test("deleteOnlineUser removes specific user", () => {
		const users = [
			{
				id: "u1",
				firstName: "Alice",
				secondName: "Smith",
				thirdName: "Johnson",
				fullName: "Alice Smith Johnson",
				email: "alice@example.com",
				phone: "+1234567890",
				avatarUrl: "https://example.com/avatar.jpg",
				avatarCreateDate: "2024-01-01T00:00:00Z",
			},
			{
				id: "u2",
				firstName: "Bob",
				secondName: "Brown",
				thirdName: "Davis",
				fullName: "Bob Brown Davis",
				email: "bob@example.com",
				phone: "+0987654321",
				avatarUrl: "https://example.com/avatar2.jpg",
				avatarCreateDate: "2024-01-02T00:00:00Z",
			},
		];

		useGlobalStore.getState().setOnlineUsers(users);
		expect(useGlobalStore.getState().onlineUsers.size).toBe(2);

		useGlobalStore.getState().deleteOnlineUser("u1");
		expect(useGlobalStore.getState().onlineUsers.size).toBe(1);
		expect(useGlobalStore.getState().onlineUsers.get("u1")).toBeUndefined();
		expect(useGlobalStore.getState().onlineUsers.get("u2")).toEqual(users[1]);

		useGlobalStore.getState().deleteOnlineUser("u2");
		expect(useGlobalStore.getState().onlineUsers.size).toBe(0);
		expect(useGlobalStore.getState().onlineUsers.get("u2")).toBeUndefined();
	});
});