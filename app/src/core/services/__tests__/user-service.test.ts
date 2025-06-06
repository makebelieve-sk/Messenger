import type Request from "@core/Request";
import NotificationSettingsService from "@core/services/NotificationSettingsService";
import PhotosService from "@core/services/PhotosService";
import UserDetailsService from "@core/services/UserDetailsService";
import UserService from "@core/services/UserService";
import type { IUserData } from "@custom-types/api.types";
import { INotificationSettings, type IPhoto, IUser, IUserDetails } from "@custom-types/models.types";
import useUserStore from "../../../__mocks__/@store/user";

jest.mock("@core/services/NotificationSettingsService");
jest.mock("@core/services/PhotosService");
jest.mock("@core/services/UserDetailsService");
jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
}));

describe("UserService", () => {
	let requestMock: Request;
	let userData: IUserData;
	let setUserMock: jest.Mock;
	let setMyAvatarMock: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		const store = useUserStore.getState();
		setUserMock = store.setUser as jest.Mock;
		setMyAvatarMock = store.setMyAvatar as jest.Mock;

		requestMock = {
			post: jest.fn(),
		} as unknown as Request;

		userData = {
			user: {
				id: "u1",
				firstName: "Alice",
				secondName: "A.",
				thirdName: "Smith",
				phone: "123",
				email: "a@example.com",
				avatarUrl: "avatar.png",
				avatarCreateDate: "2025-06-01",
			},
			userDetails: { userId: "u1", sex: "female", birthday: "1990-01-01", city: "Town", work: "Job", lastSeen: "2025-06-01" },
			notificationSettings: { enabled: true } as unknown as INotificationSettings,
			isMe: true,
		};

		(UserDetailsService as jest.Mock).mockImplementation((details: IUserDetails) => ({
			updateDetails: jest.fn(),
			syncUserDetails: jest.fn(),
			_details: details,
		}));
		(NotificationSettingsService as jest.Mock).mockImplementation((_: Request, settings: INotificationSettings) => settings);
		(PhotosService as jest.Mock).mockImplementation((_: Request, userId: string) => ({ userId }));
	});

	it("constructor initializes and updates store/services when isMe=true", () => {
		const service = new UserService(requestMock, userData);

		expect(setUserMock).toHaveBeenCalledWith({
			id: "u1",
			firstName: "Alice",
			secondName: "A.",
			thirdName: "Smith",
			phone: "123",
			email: "a@example.com",
			fullName: "Alice Smith",
			avatarUrl: "avatar.png",
			avatarCreateDate: "2025-06-01",
		});

		expect(setMyAvatarMock).toHaveBeenCalledWith({
			src: "avatar.png",
			alt: "Alice Smith",
			userId: "u1",
		});

		expect(UserDetailsService).toHaveBeenCalledWith(userData.userDetails);
		expect(NotificationSettingsService).toHaveBeenCalledWith(requestMock, userData.notificationSettings);
		expect(PhotosService).toHaveBeenCalledWith(requestMock, "u1");

		expect(service.photosService).toEqual({ userId: "u1" });
		expect(service.detailsService).toBeDefined();
		expect(service.settingsService).toEqual(userData.notificationSettings);
		expect(service.id).toBe("u1");
		expect(service.firstName).toBe("Alice");
		expect(service.secondName).toBe("A.");
		expect(service.thirdName).toBe("Smith");
		expect(service.phone).toBe("123");
		expect(service.email).toBe("a@example.com");
		expect(service.fullName).toBe("Alice Smith");
		expect(service.avatarUrl).toBe("avatar.png");
		expect(service.avatarCreateDate).toBe("2025-06-01");
	});

	it("constructor omits NotificationSettingsService when isMe=false", () => {
		const uD = { ...userData, isMe: false };
		new UserService(requestMock, uD);

		expect(NotificationSettingsService).not.toHaveBeenCalled();
		expect(setMyAvatarMock).not.toHaveBeenCalled();
		expect(PhotosService).toHaveBeenCalledWith(requestMock, "u1");
	});

	it("photosService getter returns PhotosService instance", () => {
		const uD = { ...userData, isMe: true };
		const svc = new UserService(requestMock, uD);

		expect(svc.photosService).toEqual({ userId: "u1" });
	});

	it("settingsService getter returns NotificationSettingsService instance or undefined", () => {
		const userDataTrue = { ...userData, isMe: true };
		const svcTrue = new UserService(requestMock, userDataTrue);
		expect(svcTrue.settingsService).toEqual(userData.notificationSettings);

		const userDataFalse = { user: userData.user, userDetails: userData.notificationSettings, isMe: false } as unknown as IUserData;
		const svcFalse = new UserService(requestMock, userDataFalse);
		expect(svcFalse.settingsService).toBeUndefined();
	});

	it("getters return correct primitive values", () => {
		const uD = { ...userData, isMe: true };
		const svc = new UserService(requestMock, uD);

		expect(svc.id).toBe("u1");
		expect(svc.firstName).toBe("Alice");
		expect(svc.secondName).toBe("A.");
		expect(svc.thirdName).toBe("Smith");
		expect(svc.phone).toBe("123");
		expect(svc.email).toBe("a@example.com");
		expect(svc.fullName).toBe("Alice Smith");
		expect(svc.avatarUrl).toBe("avatar.png");
		expect(svc.avatarCreateDate).toBe("2025-06-01");
	});

	it("getter secondName falls back to empty string if undefined", () => {
		const user = { ...userData.user, secondName: undefined };
		const uD = { user, userDetails: userData.userDetails, notificationSettings: userData.notificationSettings, isMe: true } as unknown as IUserData;
		const svc = new UserService(requestMock, uD);

		expect(svc.secondName).toBe("");
	});

	it("updateUser merges and calls setUser and updateDetails", () => {
		const uD = { ...userData, isMe: true };
		const svc = new UserService(requestMock, uD);
		setUserMock.mockClear();
		const uds = (UserDetailsService as jest.Mock).mock.results[0].value;
		uds.updateDetails.mockClear();

		const newUser = { id: "u1", firstName: "Bob" } as IUser;
		const newDetails = { userId: "u1", city: "NewTown" } as IUserDetails;
		svc.updateUser({ user: newUser, userDetails: newDetails });

		expect(setUserMock).toHaveBeenCalledWith({
			id: "u1",
			firstName: "Bob",
			secondName: "A.",
			thirdName: "Smith",
			phone: "123",
			email: "a@example.com",
			fullName: "Bob Smith",
			avatarUrl: "avatar.png",
			avatarCreateDate: "2025-06-01",
		});
		expect(uds.updateDetails).toHaveBeenCalledWith(newDetails);
	});

	it("syncInfo refreshes user and calls syncUserDetails", () => {
		const uD = { ...userData, isMe: true };
		const svc = new UserService(requestMock, uD);
		setUserMock.mockClear();
		const uds = (UserDetailsService as jest.Mock).mock.results[0].value;
		uds.syncUserDetails.mockClear();

		svc.syncInfo();

		expect(setUserMock).toHaveBeenCalled();
		expect(uds.syncUserDetails).toHaveBeenCalled();
	});

	it("changeAvatar updates avatar and calls setUser", () => {
		const uD = { ...userData, isMe: true };
		const svc = new UserService(requestMock, uD);
		setUserMock.mockClear();

		const updatedAvatar = { path: "new.png", createdAt: "2025-06-02" } as IPhoto;
		svc.changeAvatar(updatedAvatar);

		expect(setUserMock).toHaveBeenCalledWith({
			id: "u1",
			firstName: "Alice",
			secondName: "A.",
			thirdName: "Smith",
			phone: "123",
			email: "a@example.com",
			fullName: "Alice Smith",
			avatarUrl: "new.png",
			avatarCreateDate: "2025-06-02",
		});
	});

	it("changeAvatar with no argument sets avatar fields to null", () => {
		const uD = { ...userData, isMe: true };
		const svc = new UserService(requestMock, uD);
		setUserMock.mockClear();

		svc.changeAvatar();

		expect(setUserMock).toHaveBeenCalledWith({
			id: "u1",
			firstName: "Alice",
			secondName: "A.",
			thirdName: "Smith",
			phone: "123",
			email: "a@example.com",
			fullName: "Alice Smith",
			avatarUrl: "",
			avatarCreateDate: "",
		});
	});
});