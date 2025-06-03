import { SocketActions } from "common-types";

import UsersController from "@core/socket/controllers/Users";
import { validateHandleEvent } from "@core/socket/validation";
import toFormatAck from "@utils/to-format-socket-ack";
import mockGlobalStore from "../../../../__mocks__/@store/global";
import resetAllStores from "../../../../__mocks__/@store/index";

jest.mock("@core/socket/validation", () => ({
	validateHandleEvent: jest.fn(),
}));
jest.mock("@service/i18n", () => ({
	__esModule: true,
	default: {
		t: jest.fn((key) => `translated:${key}`),
	},
}));

jest.mock("@utils/to-format-socket-ack", () => jest.fn());

describe("UsersController", () => {
	let fakeSocket;
	let profilesControllerMock;
	let handlerMap: Record<string, Function>;
	let ackCallback: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		handlerMap = {};
		fakeSocket = {
			on: (event: string, cb: Function) => {
				handlerMap[event] = cb;
			},
			disconnect: jest.fn(),
		};
		profilesControllerMock = { removeProfile: jest.fn() };
		ackCallback = jest.fn();
	});

	it("handles GET_ALL_USERS with success and filters out current user", () => {
		(validateHandleEvent as jest.Mock).mockReturnValue({ success: true });
		new UsersController(fakeSocket, "me", profilesControllerMock);

		const users = [ { id: "me" }, { id: "u2" }, null ];
		handlerMap[SocketActions.GET_ALL_USERS]({ users }, ackCallback);

		expect(mockGlobalStore.getState().setOnlineUsers).toHaveBeenCalledWith([ { id: "u2" } ]);
		expect(toFormatAck).toHaveBeenCalledWith({ success: true }, ackCallback);
	});

	it("handles GET_ALL_USERS with failure and does not update store", () => {
		(validateHandleEvent as jest.Mock).mockReturnValue({ success: false, message: "fail" });
		new UsersController(fakeSocket, "me", profilesControllerMock);

		handlerMap[SocketActions.GET_ALL_USERS]({ users: [] }, ackCallback);
		expect(mockGlobalStore.getState().setOnlineUsers).not.toHaveBeenCalled();
		expect(toFormatAck).toHaveBeenCalledWith({ success: false, message: "fail" }, ackCallback);
	});

	it("handles GET_NEW_USER with success", () => {
		(validateHandleEvent as jest.Mock).mockReturnValue({ success: true });
		new UsersController(fakeSocket, "me", profilesControllerMock);

		const user = { id: "u3" };
		handlerMap[SocketActions.GET_NEW_USER]({ user }, ackCallback);

		expect(mockGlobalStore.getState().addOnlineUsers).toHaveBeenCalledWith(user);
		expect(toFormatAck).toHaveBeenCalledWith({ success: true }, ackCallback);
	});

	it("handles GET_NEW_USER with failure", () => {
		(validateHandleEvent as jest.Mock).mockReturnValue({ success: false, message: "nope" });
		new UsersController(fakeSocket, "me", profilesControllerMock);

		handlerMap[SocketActions.GET_NEW_USER]({ user: { id: "u3" } }, ackCallback);
		expect(mockGlobalStore.getState().addOnlineUsers).not.toHaveBeenCalled();
		expect(toFormatAck).toHaveBeenCalledWith({ success: false, message: "nope" }, ackCallback);
	});

	it("handles USER_DISCONNECT with success", () => {
		(validateHandleEvent as jest.Mock).mockReturnValue({ success: true });
		new UsersController(fakeSocket, "me", profilesControllerMock);

		const userId = "u2";
		handlerMap[SocketActions.USER_DISCONNECT]({ userId }, ackCallback);

		expect(mockGlobalStore.getState().deleteOnlineUser).toHaveBeenCalledWith(userId);
		expect(toFormatAck).toHaveBeenCalledWith({ success: true }, ackCallback);
	});

	it("handles USER_DISCONNECT with failure", () => {
		(validateHandleEvent as jest.Mock).mockReturnValue({ success: false, message: "err" });
		new UsersController(fakeSocket, "me", profilesControllerMock);

		handlerMap[SocketActions.USER_DISCONNECT]({ userId: "u2" }, ackCallback);
		expect(mockGlobalStore.getState().deleteOnlineUser).not.toHaveBeenCalled();
		expect(toFormatAck).toHaveBeenCalledWith({ success: false, message: "err" }, ackCallback);
	});

	it("handles LOG_OUT with success", () => {
		(validateHandleEvent as jest.Mock).mockReturnValue({ success: true });
		new UsersController(fakeSocket, "me", profilesControllerMock);

		handlerMap[SocketActions.LOG_OUT]({}, ackCallback);

		expect(resetAllStores).toHaveBeenCalled();
		expect(profilesControllerMock.removeProfile).toHaveBeenCalled();
		expect(toFormatAck).toHaveBeenCalledWith(
			{ success: true },
			ackCallback,
			expect.any(Function),
		);
		const extra = (toFormatAck as jest.Mock).mock.calls[0][2];
		extra();
		expect(fakeSocket.disconnect).toHaveBeenCalled();
	});

	it("handles LOG_OUT with failure", () => {
		(validateHandleEvent as jest.Mock).mockReturnValue({ success: false, message: "bad" });
		new UsersController(fakeSocket, "me", profilesControllerMock);

		handlerMap[SocketActions.LOG_OUT]({}, ackCallback);
		expect(resetAllStores).not.toHaveBeenCalled();
		expect(profilesControllerMock.removeProfile).not.toHaveBeenCalled();
		expect(toFormatAck).toHaveBeenCalledWith({ success: false, message: "bad" }, ackCallback, expect.any(Function));
	});
});