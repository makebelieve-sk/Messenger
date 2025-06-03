import { ApiRoutes } from "common-types";

import ProfilesController from "@core/controllers/ProfilesController";
import MainApi from "@core/MainApi";
import Request from "@core/Request";
import Socket from "@core/socket/Socket";
import type { IUserData } from "@custom-types/api.types";
import useAuthStore from "../../__mocks__/@store/auth";

jest.mock("@core/Request");
jest.mock("@core/controllers/ProfilesController");
jest.mock("@core/socket/Socket");
jest.mock("@store/auth");
jest.mock("@store/user");

describe("MainApi", () => {
	let requestInstance: jest.Mocked<Request>;
	let profilesControllerInstance: jest.Mocked<ProfilesController>;
	let socketInstance: jest.Mocked<Socket>;
	let mainApi: MainApi;

	const mockUserData: IUserData = {
		user: {
			id: "123",
			firstName: "Test",
			secondName: null,
			thirdName: "User",
			email: "test@example.com",
			phone: "+1234567890",
			avatarUrl: null,
			avatarCreateDate: null,
		},
		userDetails: {
			userId: "123",
			birthday: "1990-01-01",
			city: null,
			work: null,
			sex: null,
			lastSeen: null,
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();

		requestInstance = {
			get: jest.fn(),
			post: jest.fn(),
		} as unknown as jest.Mocked<Request>;

		profilesControllerInstance = {
			createProfile: jest.fn(),
		} as unknown as jest.Mocked<ProfilesController>;

		socketInstance = {
			init: jest.fn(),
		} as unknown as jest.Mocked<Socket>;

		mainApi = new MainApi(requestInstance, profilesControllerInstance, socketInstance);
	});

	test("constructor initializes and calls _getMe", () => {
		expect(requestInstance.get).toHaveBeenCalledWith(expect.objectContaining({
			route: ApiRoutes.getMe,
		}));
	});

	test("getAnotherUser makes correct request", () => {
		const userId = "456";
		mainApi.getAnotherUser(userId);

		expect(requestInstance.post).toHaveBeenCalledWith(expect.objectContaining({
			route: ApiRoutes.getUser,
			data: { id: userId },
		}));
	});

	test("getAnotherUser success callback creates profile without isMe flag", () => {
		const userId = "456";
		mainApi.getAnotherUser(userId);

		const successCb = (requestInstance.post.mock.calls[0][0] as { 
			successCb: (data: { user: IUserData["user"]; userDetails: IUserData["userDetails"] }) => void 
		}).successCb;
		successCb({ user: mockUserData.user, userDetails: mockUserData.userDetails });

		expect(profilesControllerInstance.createProfile).toHaveBeenCalledWith({
			user: mockUserData.user,
			userDetails: mockUserData.userDetails,
		});
	});

	test("signIn makes correct request and updates auth store", () => {
		const signInData = { email: "test@example.com", password: "password" };
		const setSignInLoading = jest.fn();
		(useAuthStore.getState as jest.Mock).mockReturnValue({ setSignInLoading });

		mainApi.signIn(signInData);

		expect(requestInstance.post).toHaveBeenCalledWith(expect.objectContaining({
			route: ApiRoutes.signIn,
			data: signInData,
		}));
	});

	test("signIn success callback creates profile with isMe flag", () => {
		const signInData = { email: "test@example.com", password: "password" };
		const setSignInLoading = jest.fn();
		(useAuthStore.getState as jest.Mock).mockReturnValue({ setSignInLoading });

		mainApi.signIn(signInData);

		const successCb = (requestInstance.post.mock.calls[0][0] as { successCb: (data: IUserData) => void }).successCb;
		successCb(mockUserData);

		expect(profilesControllerInstance.createProfile).toHaveBeenCalledWith({
			...mockUserData,
			isMe: true,
		});
		expect(socketInstance.init).toHaveBeenCalledWith(mockUserData.user.id);
	});

	test("signIn updates loading state correctly", () => {
		const signInData = { email: "test@example.com", password: "password" };
		const setSignInLoading = jest.fn();
		(useAuthStore.getState as jest.Mock).mockReturnValue({ setSignInLoading });

		mainApi.signIn(signInData);

		const setLoading = (requestInstance.post.mock.calls[0][0] as { setLoading: (isLoading: boolean) => void }).setLoading;
    
		setLoading(true);
		expect(setSignInLoading).toHaveBeenCalledWith(true);
    
		setLoading(false);
		expect(setSignInLoading).toHaveBeenCalledWith(false);
	});

	test("signUp makes correct request and updates auth store", () => {
		const signUpData = { email: "test@example.com", password: "password", name: "Test User" };
		const setSignUpLoading = jest.fn();
		(useAuthStore.getState as jest.Mock).mockReturnValue({ setSignUpLoading });

		mainApi.signUp(signUpData);

		expect(requestInstance.post).toHaveBeenCalledWith(expect.objectContaining({
			route: ApiRoutes.signUp,
			data: signUpData,
		}));
	});

	test("signUp success callback creates profile with isMe flag", () => {
		const signUpData = { email: "test@example.com", password: "password", name: "Test User" };
		const setSignUpLoading = jest.fn();
		(useAuthStore.getState as jest.Mock).mockReturnValue({ setSignUpLoading });

		mainApi.signUp(signUpData);

		const successCb = (requestInstance.post.mock.calls[0][0] as { successCb: (data: IUserData) => void }).successCb;
		successCb(mockUserData);

		expect(profilesControllerInstance.createProfile).toHaveBeenCalledWith({
			...mockUserData,
			isMe: true,
		});
		expect(socketInstance.init).toHaveBeenCalledWith(mockUserData.user.id);
	});

	test("signUp updates loading state correctly", () => {
		const signUpData = { email: "test@example.com", password: "password", name: "Test User" };
		const setSignUpLoading = jest.fn();
		(useAuthStore.getState as jest.Mock).mockReturnValue({ setSignUpLoading });

		mainApi.signUp(signUpData);

		const setLoading = (requestInstance.post.mock.calls[0][0] as { setLoading: (isLoading: boolean) => void }).setLoading;
    
		setLoading(true);
		expect(setSignUpLoading).toHaveBeenCalledWith(true);
    
		setLoading(false);
		expect(setSignUpLoading).toHaveBeenCalledWith(false);
	});

	test("logout makes correct request", () => {
		mainApi.logout();
		expect(requestInstance.get).toHaveBeenCalledWith({ route: ApiRoutes.logout });
	});

	test("uploadAvatarAuth makes correct request", () => {
		const route = ApiRoutes.uploadAvatar;
		const data = new FormData();
		const setLoading = jest.fn();
		const callback = jest.fn();

		mainApi.uploadAvatarAuth(route, data, setLoading, callback);

		expect(requestInstance.post).toHaveBeenCalledWith(expect.objectContaining({
			route,
			data,
			setLoading,
			successCb: callback,
			config: { headers: { "Content-Type": "multipart/form-data" } },
		}));
	});

	test("openFile makes correct request", () => {
		const fileData = { fileId: "123" };
		mainApi.openFile(fileData);
		expect(requestInstance.post).toHaveBeenCalledWith(expect.objectContaining({
			route: ApiRoutes.openFile,
			data: fileData,
		}));
	});

	test("_initNewUser creates profile and initializes socket for own user", () => {
		const userData = { ...mockUserData, isMe: true };
		const successCb = (requestInstance.get.mock.calls[0][0] as { successCb: (data: IUserData) => void }).successCb;
    
		successCb(userData);

		expect(profilesControllerInstance.createProfile).toHaveBeenCalledWith({
			...userData,
			isMe: true,
		});
		expect(socketInstance.init).toHaveBeenCalledWith(userData.user.id);
	});

	test("_initNewUser only creates profile for other users", () => {
		const userData = { ...mockUserData };
		mainApi.getAnotherUser("456");

		const successCb = (requestInstance.post.mock.calls[0][0] as { 
			successCb: (data: { user: IUserData["user"]; userDetails: IUserData["userDetails"] }) => void 
		}).successCb;
		successCb({ user: userData.user, userDetails: userData.userDetails });

		expect(profilesControllerInstance.createProfile).toHaveBeenCalledWith({
			user: userData.user,
			userDetails: userData.userDetails,
		});
		expect(socketInstance.init).not.toHaveBeenCalled();
	});
});
