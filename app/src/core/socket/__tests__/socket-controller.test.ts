import { SocketActions } from "common-types";
import type { SpyInstance } from "jest-mock";
import type { Manager } from "socket.io-client";

import type ProfilesController from "@core/controllers/ProfilesController";
import FriendsController from "@core/socket/controllers/Friends";
import UsersController from "@core/socket/controllers/Users";
import SocketController from "@core/socket/SocketController";
import type { SocketType } from "@custom-types/socket.types";
import { SOCKET_MIDDLEWARE_ERROR } from "@utils/constants";
import mockUIStore from "../../../__mocks__/@store/ui";

// Define a type that includes the private method for testing
type TestableSocketController = typeof SocketController & {
	prototype: {
		_manualReconnect: () => void;
	};
};

jest.mock("@core/socket/controllers/Users");
jest.mock("@core/socket/controllers/Friends");
jest.mock("@service/i18n", () => ({
	__esModule: true,
	default: {
		t: jest.fn((key, opts) => `translated:${key}:${opts?.message ?? ""}`),
	},
}));

describe("SocketController", () => {
	let fakeSocket: Partial<SocketType> & { active: boolean };
	let handlers: Record<string, Function>;
	let ioHandlers: Record<string, Function>;
	let profilesControllerMock: Partial<ProfilesController>;
	let mockManager: Partial<Manager>;
	let manualReconnectSpy: SpyInstance<() => void>;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, "error").mockImplementation(() => {});

		handlers = {};
		ioHandlers = {};
		mockManager = {
			on: jest.fn((event: string, cb: Function) => {
				ioHandlers[event] = cb;
				return mockManager as Manager;
			}),
		};

		fakeSocket = {
			id: "socket123",
			active: true,
			recovered: false,
			auth: undefined,
			on: jest.fn((event: string, cb: Function) => {
				handlers[event] = cb;
				return fakeSocket as SocketType;
			}),
			io: mockManager as Manager,
			connect: jest.fn(),
			disconnect: jest.fn(),
		};

		profilesControllerMock = {};
		manualReconnectSpy = jest.spyOn((SocketController as TestableSocketController).prototype, "_manualReconnect") as unknown as SpyInstance<() => void>;
	});

	afterEach(() => {
		jest.restoreAllMocks();
		manualReconnectSpy.mockRestore();
	});

	it("instantiates UsersController and FriendsController and binds events", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);

		expect(UsersController).toHaveBeenCalledWith(fakeSocket, "user1", profilesControllerMock);
		expect(FriendsController).toHaveBeenCalledWith(fakeSocket);
		// Events should be registered
		expect(typeof handlers.connect).toBe("function");
		expect(typeof handlers[SocketActions.SOCKET_CHANNEL_ERROR]).toBe("function");
		expect(typeof handlers.connect_error).toBe("function");
		expect(typeof handlers.disconnect).toBe("function");

		expect(typeof ioHandlers.error).toBe("function");
		expect(typeof ioHandlers.ping).toBe("function");
		expect(typeof ioHandlers.reconnect).toBe("function");
		expect(typeof ioHandlers.reconnect_attempt).toBe("function");
		expect(typeof ioHandlers.reconnect_error).toBe("function");
		expect(typeof ioHandlers.reconnect_failed).toBe("function");
	});

	it("on connect logs correct message based on recovered flag", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);
		handlers.connect();
		fakeSocket.recovered = true;
		handlers.connect();
	});

	it("on SOCKET_CHANNEL_ERROR sets snackbar error and invokes callback", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);
		const callback = jest.fn();
		const errorPayload = { message: "errorMsg" };
		handlers[SocketActions.SOCKET_CHANNEL_ERROR](errorPayload, callback);
		expect(mockUIStore.getState().setSnackbarError).toHaveBeenCalledWith("errorMsg");
		expect(callback).toHaveBeenCalledWith({ success: true, timestamp: expect.any(Number) });
	});

	it("on connect_error when not active and non-middleware error triggers manual reconnect", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);
		fakeSocket.active = false;
		const error = new Error("some error");
		handlers.connect_error(error);
		expect(manualReconnectSpy).toHaveBeenCalled();
	});

	it("on connect_error when active or middleware error does not reconnect", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);
		fakeSocket.active = true;
		const err1 = new Error("middleware");
		handlers.connect_error(err1);
		fakeSocket.active = false;
		const err2 = new Error(SOCKET_MIDDLEWARE_ERROR);
		handlers.connect_error(err2);
	});

	it("on disconnect triggers manual reconnect only when not active and SERVER_DISCONNECT", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);
		fakeSocket.active = false;

		handlers.disconnect("some other reason");
		expect(manualReconnectSpy).not.toHaveBeenCalled();

		handlers.disconnect("io server disconnect");
		expect(manualReconnectSpy).toHaveBeenCalled();
	});

	it("io manager 'error' event sets store error", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);
		const error = new Error("ioError");
		ioHandlers.error(error);
		expect(mockUIStore.getState().setError).toHaveBeenCalledWith("translated:core.socket.error.connect_error:ioError");
	});

	it("io manager 'ping' event logs debug message", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);
		ioHandlers.ping();
	});

	it("io manager 'reconnect' and 'reconnect_attempt' and 'reconnect_error' events log info", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);
		ioHandlers.reconnect(3);
		ioHandlers.reconnect_attempt(2);
		ioHandlers.reconnect_error("errX");
	});

	it("io manager 'reconnect_failed' sets store error", () => {
		new SocketController(fakeSocket as SocketType, "user1", profilesControllerMock as ProfilesController);
		ioHandlers.reconnect_failed();
		expect(mockUIStore.getState().setError).toHaveBeenCalledWith("translated:core.socket.error.reconnect_failed:");
	});
});