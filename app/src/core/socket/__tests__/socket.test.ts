import { io } from "socket.io-client";

import Socket from "@core/socket/Socket";
import SocketController from "@core/socket/SocketController";
import { validateEmitEvent } from "@core/socket/validation";
import mockUIStore from "../../../__mocks__/@store/ui";

jest.mock("socket.io-client", () => ({
	io: jest.fn(),
}));

jest.mock("@core/socket/SocketController");
jest.mock("@core/socket/validation", () => ({
	validateEmitEvent: jest.fn(),
}));
jest.mock("@service/i18n", () => ({
	t: jest.fn((key, opts) => `translated:${key}:${opts?.message ?? ""}${opts?.timestamp ?? ""}`),
}));

describe("Socket", () => {
	let profilesControllerMock;
	let fakeSocket;

	beforeEach(() => {
		jest.clearAllMocks();

		profilesControllerMock = {};

		fakeSocket = {
			auth: undefined,
			connect: jest.fn(),
			disconnect: jest.fn(),
			timeout: jest.fn(() => ({
				emitWithAck: jest.fn(),
			})),
		};
		(io as jest.Mock).mockReturnValue(fakeSocket);
	});

	describe("init", () => {
		it("sets error if myId is falsy", () => {
			const socket = new Socket(profilesControllerMock);
			socket.init("");
			expect(mockUIStore.getState().setError).toHaveBeenCalledWith("translated:core.socket.error.user_not_exists:");
			expect(io).not.toHaveBeenCalled();
		});

		it("initializes socket when myId is valid", () => {
			const socket = new Socket(profilesControllerMock);
			socket.init("user123");

			expect(io).toHaveBeenCalledWith(expect.any(String), {
				transports: [ "websocket" ],
				autoConnect: false,
				reconnection: true,
				reconnectionAttempts: expect.any(Number),
				reconnectionDelay: expect.any(Number),
				forceNew: false,
				upgrade: true,
				closeOnBeforeunload: true,
				withCredentials: true,
			});
			expect(fakeSocket.auth).toEqual({ userId: "user123" });
			expect(fakeSocket.connect).toHaveBeenCalled();
			expect(SocketController).toHaveBeenCalledWith(fakeSocket, "user123", profilesControllerMock);
		});
	});

	describe("send", () => {
		it("does nothing if validateEmitEvent returns falsy", async () => {
			(validateEmitEvent as jest.Mock).mockReturnValue(null);
			const socket = new Socket(profilesControllerMock);
			socket["_socket"] = fakeSocket;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await socket.send<any>("eventType", { foo: "bar" });
			expect(fakeSocket.timeout).not.toHaveBeenCalled();
			expect(mockUIStore.getState().setError).not.toHaveBeenCalled();
		});

		it("logs on successful emitWithAck", async () => {
			(validateEmitEvent as jest.Mock).mockReturnValue({ success: true, message: "", timestamp: 123 });
			const emitWithAckMock = jest.fn().mockResolvedValue({ success: true, message: "", timestamp: 123 });
			fakeSocket.timeout.mockReturnValue({ emitWithAck: emitWithAckMock });

			const socket = new Socket(profilesControllerMock);
			socket["_socket"] = fakeSocket;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await socket.send<any>("eventType", { foo: "bar" });
			expect(emitWithAckMock).toHaveBeenCalledWith("eventType", { foo: "bar" });
		});

		it("sets error on emitWithAck success=false", async () => {
			(validateEmitEvent as jest.Mock).mockReturnValue({ success: true, message: "err", timestamp: 456 });
			const emitWithAckMock = jest.fn().mockResolvedValue({ success: false, message: "err", timestamp: 456 });
			fakeSocket.timeout.mockReturnValue({ emitWithAck: emitWithAckMock });

			const socket = new Socket(profilesControllerMock);
			socket["_socket"] = fakeSocket;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await socket.send<any>("eventType", { foo: "bar" });
			expect(mockUIStore.getState().setError).toHaveBeenCalledWith(
				"translated:core.socket.error.emit:translated:core.socket.error.emit_event_on_the_server:err456",
			);
		});

		it("sets error when emitWithAck throws", async () => {
			(validateEmitEvent as jest.Mock).mockReturnValue({ success: true, message: "", timestamp: 0 });
			const emitWithAckMock = jest.fn().mockRejectedValue(new Error("fail"));
			fakeSocket.timeout.mockReturnValue({ emitWithAck: emitWithAckMock });

			const socket = new Socket(profilesControllerMock);
			socket["_socket"] = fakeSocket;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await socket.send<any>("eventType", { foo: "bar" });
			expect(mockUIStore.getState().setError).toHaveBeenCalledWith("translated:core.socket.error.emit:Error: fail");
		});
	});

	describe("disconnect", () => {
		it("calls disconnect on socket", () => {
			const socket = new Socket(profilesControllerMock);
			socket["_socket"] = fakeSocket;
			socket.disconnect();
			expect(fakeSocket.disconnect).toHaveBeenCalled();
		});
	});
});
