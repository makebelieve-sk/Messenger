import CatchErrors from "@core/CatchErrors";
import ProfilesController from "@core/controllers/ProfilesController";
import MainApi from "@core/MainApi";
import MainClient from "@core/MainClient";
import Request from "@core/Request";
import Socket from "@core/socket/Socket";

jest.mock("@core/CatchErrors");
jest.mock("@core/Request");
jest.mock("@core/controllers/ProfilesController");
jest.mock("@core/socket/Socket");
jest.mock("@core/MainApi");

describe("MainClient", () => {
	let catchErrorsInstance: jest.Mocked<CatchErrors>;
	let requestInstance: jest.Mocked<Request>;
	let profilesControllerInstance: jest.Mocked<ProfilesController>;
	let socketInstance: jest.Mocked<Socket>;
	let mainApiInstance: jest.Mocked<MainApi>;

	beforeEach(() => {
		jest.clearAllMocks();

		catchErrorsInstance = {
			_errorText: "",
			_axiosError: null,
			_response: null,
			catchAxios: jest.fn(),
			catchError: jest.fn(),
			catchResponse: jest.fn(),
			getErrorText: jest.fn(),
			getAxiosError: jest.fn(),
			getResponse: jest.fn(),
			reset: jest.fn(),
		} as unknown as jest.Mocked<CatchErrors>;
		(CatchErrors as jest.Mock).mockImplementation(() => catchErrorsInstance);

		requestInstance = {
			_instance: null,
			_catchErrors: catchErrorsInstance,
			_errorHandler: jest.fn(),
			get: jest.fn(),
			post: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
			setErrorHandler: jest.fn(),
		} as unknown as jest.Mocked<Request>;
		(Request as jest.Mock).mockImplementation((ce: CatchErrors) => {
			expect(ce).toBe(catchErrorsInstance);
			return requestInstance;
		});

		profilesControllerInstance = {
			_profiles: new Map(),
			_request: requestInstance,
			profiles: new Map(),
			getProfile: jest.fn(),
			createProfile: jest.fn(),
			checkProfile: jest.fn(),
			getMyProfileId: jest.fn(),
			removeProfile: jest.fn(),
		} as unknown as jest.Mocked<ProfilesController>;
		(ProfilesController as jest.Mock).mockImplementation((req: Request) => {
			expect(req).toBe(requestInstance);
			return profilesControllerInstance;
		});

		socketInstance = {
			_socket: null,
			_myId: "",
			_profilesController: profilesControllerInstance,
			init: jest.fn(),
			close: jest.fn(),
			send: jest.fn(),
		} as unknown as jest.Mocked<Socket>;
		(Socket as jest.Mock).mockImplementation((pc: ProfilesController) => {
			expect(pc).toBe(profilesControllerInstance);
			return socketInstance;
		});

		mainApiInstance = {
			_request: requestInstance,
			_profilesController: profilesControllerInstance,
			_socket: socketInstance,
			getAnotherUser: jest.fn(),
			getFriends: jest.fn(),
			getMessages: jest.fn(),
			sendMessage: jest.fn(),
			deleteMessage: jest.fn(),
			editMessage: jest.fn(),
			readMessage: jest.fn(),
			getUnreadCount: jest.fn(),
			getOnlineUsers: jest.fn(),
		} as unknown as jest.Mocked<MainApi>;
		(MainApi as jest.Mock).mockImplementation((req: Request, pc: ProfilesController, socket: Socket) => {
			expect(req).toBe(requestInstance);
			expect(pc).toBe(profilesControllerInstance);
			expect(socket).toBe(socketInstance);
			return mainApiInstance;
		});
	});

	test("constructor initializes dependencies correctly", () => {
		new MainClient();
		expect(CatchErrors).toHaveBeenCalledTimes(1);
		expect(Request).toHaveBeenCalledWith(catchErrorsInstance);
		expect(ProfilesController).toHaveBeenCalledWith(requestInstance);
		expect(Socket).toHaveBeenCalledWith(profilesControllerInstance);
		expect(MainApi).toHaveBeenCalledWith(requestInstance, profilesControllerInstance, socketInstance);
	});

	test("mainApi getter returns instance of MainApi", () => {
		const client = new MainClient();
		expect(client.mainApi).toBe(mainApiInstance);
	});

	test("getProfile delegates to profilesController.getProfile", () => {
		const client = new MainClient();
		client.getProfile("user123");
		expect(profilesControllerInstance.getProfile).toHaveBeenCalledWith("user123");
	});

	test("existProfile delegates to profilesController.checkProfile", () => {
		const client = new MainClient();
		client.existProfile("user456");
		expect(profilesControllerInstance.checkProfile).toHaveBeenCalledWith("user456");
	});

	test("lifeTimeExpire calls removeProfile if getMyProfileId returns truthy", () => {
		(profilesControllerInstance.getMyProfileId as jest.Mock).mockReturnValue("myId");
		const client = new MainClient();
		client.lifeTimeExpire();
		expect(profilesControllerInstance.removeProfile).toHaveBeenCalled();
	});

	test("lifeTimeExpire does not call removeProfile if getMyProfileId returns falsy", () => {
		(profilesControllerInstance.getMyProfileId as jest.Mock).mockReturnValue(null);
		const client = new MainClient();
		client.lifeTimeExpire();
		expect(profilesControllerInstance.removeProfile).not.toHaveBeenCalled();
	});

	test("removeProfile calls profilesController.removeProfile", () => {
		const client = new MainClient();
		client.removeProfile();
		expect(profilesControllerInstance.removeProfile).toHaveBeenCalled();
	});

	test("downloadLogFile calls logger.downloadToFile", () => {
		const mockCreateObjectURL = jest.fn();
		const mockRevokeObjectURL = jest.fn();
		global.URL.createObjectURL = mockCreateObjectURL;
		global.URL.revokeObjectURL = mockRevokeObjectURL;

		const client = new MainClient();
		client.downloadLogFile();
	});
});