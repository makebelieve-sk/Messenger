import type FriendsController from "@core/controllers/FriendsController";
import ProfilesController from "@core/controllers/ProfilesController";
import { type NotificationSettings } from "@core/models/NotificationSettings";
import { type Photos } from "@core/models/Photos";
import { type User } from "@core/models/User";
import { type UserDetails } from "@core/models/UserDetails";
import type Request from "@core/Request";
import ProfileService from "@core/services/ProfileService";
import useProfileStore from "@store/profile";
import { type IUserData } from "@custom-types/api.types";
import useUIStore from "../../../__mocks__/@store/ui";

jest.mock("@core/services/ProfileService");
jest.mock("@store/profile");
jest.mock("@store/ui");
jest.mock("@service/i18n", () => ({
	t: jest.fn().mockImplementation((key: string, params?) => {
		if (key === "core.profiles-controller.error.profile_not_exists") {
			return `Profile with id ${params.id} does not exist`;
		}
		if (key === "core.profiles-controller.error.my_profile_not_exists") {
			return "My profile does not exist";
		}
		return key;
	}),
}));

describe("ProfilesController", () => {
	let controller: ProfilesController;
	let mockRequest: jest.Mocked<Request>;
	let mockProfileService: jest.Mocked<ProfileService>;
	let mockUserData: IUserData;

	beforeEach(() => {
		jest.clearAllMocks();

		mockRequest = {} as jest.Mocked<Request>;

		const mockUser: User = {
			photosService: {} as Photos,
			detailsService: {} as UserDetails,
			settingsService: {} as NotificationSettings,
			friendsService: {
				friendsController: {} as FriendsController,
				checkOnlineUsers: jest.fn(),
				removeOnlineUser: jest.fn(),
				getFriends: jest.fn(),
				loadMore: jest.fn(),
				search: jest.fn(),
				followFriend: jest.fn(),
				writeMessage: jest.fn(),
				addFriend: jest.fn(),
				accept: jest.fn(),
				leftInFollowers: jest.fn(),
				unfollow: jest.fn(),
				deleteFriend: jest.fn(),
				blockFriend: jest.fn(),
				unblock: jest.fn(),
			},
			id: "test-user-id",
			firstName: "Test",
			thirdName: "User",
			phone: "+1234567890",
			email: "test@example.com",
			fullName: "Test User",
			avatarUrl: "",
			avatarCreateDate: "",
			updateUser: jest.fn(),
			syncInfo: jest.fn(),
			changeAvatar: jest.fn(),
		};

		const mockProfileServiceBase = {
			_user: mockUser,
			_isMe: false,
			_request: mockRequest,
			_userData: {} as IUserData,
			userService: mockUser,
			photosService: {} as Photos,
			deleteAccount: jest.fn(),
			onSetAvatar: jest.fn(),
			onDeleteAvatar: jest.fn(),
			onClickAvatar: jest.fn(),
			getFriends: jest.fn(),
			editInfo: jest.fn(),
			get isMe() {
				return this._isMe;
			},
		};

		mockProfileService = mockProfileServiceBase as unknown as jest.Mocked<ProfileService>;

		mockUserData = {
			user: {
				id: "test-user-id",
				firstName: "Test",
				secondName: "Middle",
				thirdName: "User",
				phone: "+1234567890",
				email: "test@example.com",
				avatarUrl: "",
				avatarCreateDate: "",
			},
			userDetails: {
				userId: "test-user-id",
				birthday: "1990-01-01",
				city: "Test City",
				work: "Test Company",
				sex: "male",
				lastSeen: "2024-01-01T00:00:00Z",
			},
		};

		(ProfileService as jest.Mock).mockImplementation(() => mockProfileService);

		const mockStoreState = {
			error: null,
			snackbarError: null,
			confirmModal: null,
			settingsModal: false,
			saveSettingsModal: false,
			setError: jest.fn(),
			setSnackbarError: jest.fn(),
			setConfirmModal: jest.fn(),
			setSettingsModal: jest.fn(),
			setSaveSettingsModal: jest.fn(),
			reset: jest.fn(),
		};
		(useUIStore.getState as jest.Mock).mockReturnValue(mockStoreState);

		controller = new ProfilesController(mockRequest);
	});

	describe("getProfile", () => {
		it("should return profile when userId is provided and profile exists", () => {
			const userId = "test-user-id";
			controller["_profiles"].set(userId, mockProfileService);

			const result = controller.getProfile(userId);

			expect(result).toBe(mockProfileService);
		});

		it("should return my profile when no userId is provided and my profile exists", () => {
			const myProfileId = "my-profile-id";
			Object.defineProperty(mockProfileService, "_isMe", { value: true });
			controller["_profiles"].set(myProfileId, mockProfileService);

			jest.spyOn(controller, "getMyProfileId").mockReturnValue(myProfileId);

			const result = controller.getProfile();

			expect(result).toBe(mockProfileService);
		});

		it("should show error when profile does not exist", () => {
			const userId = "non-existent-id";
			const mockSetError = jest.fn();
			useUIStore.getState().setError = mockSetError;

			controller.getProfile(userId);

			expect(mockSetError).toHaveBeenCalled();
		});

		it("should show error when no userId provided and my profile does not exist", () => {
			const mockSetError = jest.fn();
			useUIStore.getState().setError = mockSetError;

			jest.spyOn(controller, "getMyProfileId").mockReturnValue(undefined);

			controller.getProfile();

			expect(mockSetError).toHaveBeenCalledWith("My profile does not exist");
		});

		it("should show error when my profile does not exist in profiles map", () => {
			const myProfileId = "my-profile-id";
			const mockSetError = jest.fn();
			useUIStore.getState().setError = mockSetError;

			jest.spyOn(controller, "getMyProfileId").mockReturnValue(myProfileId);

			controller.getProfile();

			expect(mockSetError).toHaveBeenCalledWith(expect.stringContaining("Profile with id"));
		});
	});

	describe("profiles getter", () => {
		it("should return the internal profiles map", () => {
			const userId = "test-user-id";
			controller["_profiles"].set(userId, mockProfileService);

			const profiles = controller.profiles;

			expect(profiles).toBe(controller["_profiles"]);
			expect(profiles.has(userId)).toBe(true);
			expect(profiles.get(userId)).toBe(mockProfileService);
		});

		it("should return empty map when no profiles exist", () => {
			const profiles = controller.profiles;

			expect(profiles).toBe(controller["_profiles"]);
			expect(profiles.size).toBe(0);
		});
	});

	describe("createProfile", () => {
		it("should create new profile when it does not exist", () => {
			const mockSetPrepareAnotherUser = jest.fn();
			(useProfileStore.getState as jest.Mock).mockReturnValue({ 
				setPrepareAnotherUser: mockSetPrepareAnotherUser, 
			});

			controller.createProfile(mockUserData);

			expect(ProfileService).toHaveBeenCalledWith(mockRequest, mockUserData);
			expect(controller["_profiles"].has(mockUserData.user.id)).toBe(true);
			expect(mockSetPrepareAnotherUser).toHaveBeenCalledWith(false);
		});

		it("should show error when profile already exists", () => {
			const mockSetError = jest.fn();
			useUIStore.getState().setError = mockSetError;

			controller.createProfile(mockUserData);
			controller.createProfile(mockUserData);

			expect(mockSetError).toHaveBeenCalled();
		});
	});

	describe("removeProfile", () => {
		it("should remove profile when it exists", () => {
			const myProfileId = "my-profile-id";
			Object.defineProperty(mockProfileService, "_isMe", { value: true });
			controller["_profiles"].set(myProfileId, mockProfileService);

			jest.spyOn(controller, "getMyProfileId").mockReturnValue(myProfileId);

			controller.removeProfile();

			expect(controller["_profiles"].has(myProfileId)).toBe(false);
		});

		it("should show error when my profile does not exist", () => {
			const mockSetError = jest.fn();
			useUIStore.getState().setError = mockSetError;

			jest.spyOn(controller, "getMyProfileId").mockReturnValue(undefined);

			controller.removeProfile();

			expect(mockSetError).toHaveBeenCalled();
		});
	});

	describe("checkProfile", () => {
		it("should return profile when it exists", () => {
			const userId = "test-user-id";
			controller["_profiles"].set(userId, mockProfileService);

			const result = controller.checkProfile(userId);

			expect(result).toBe(mockProfileService);
		});

		it("should return null when profile does not exist", () => {
			const result = controller.checkProfile("non-existent-id");

			expect(result).toBeNull();
		});

		it("should check my profile when no userId is provided", () => {
			const myProfileId = "my-profile-id";
			Object.defineProperty(mockProfileService, "_isMe", { value: true });
			controller["_profiles"].set(myProfileId, mockProfileService);

			jest.spyOn(controller, "getMyProfileId").mockReturnValue(myProfileId);

			const result = controller.checkProfile();

			expect(result).toBe(mockProfileService);
		});
	});

	describe("getMyProfileId", () => {
		it("should return my profile id when it exists", () => {
			const myProfileId = "my-profile-id";
			Object.defineProperty(mockProfileService, "_isMe", { value: true });
			controller["_profiles"].set(myProfileId, mockProfileService);

			const result = controller.getMyProfileId();

			expect(result).toBe(myProfileId);
		});

		it("should return undefined when my profile does not exist", () => {
			const result = controller.getMyProfileId();

			expect(result).toBeUndefined();
		});
	});
});
