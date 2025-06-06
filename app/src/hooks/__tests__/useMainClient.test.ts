import { useContext } from "react";
import { renderHook } from "@testing-library/react";

import MainClient from "@core/MainClient";
import useMainClient from "../useMainClient";

jest.mock("react", () => ({
	...jest.requireActual("react"),
	useContext: jest.fn(),
}));

describe("useMainClient", () => {
	const mockMainClient: MainClient = {
		mainApi: {
			signUp: jest.fn(),
			signIn: jest.fn(),
			logout: jest.fn(),
			getAnotherUser: jest.fn(),
			getFriendsNotification: jest.fn(),
			getMessageNotification: jest.fn(),
			openFile: jest.fn(),
			uploadAvatarAuth: jest.fn(),
		},
		removeProfile: jest.fn(),
		getProfile: jest.fn(),
		existProfile: jest.fn(),
		lifeTimeExpire: jest.fn(),
		downloadLogFile: jest.fn(),
	} as unknown as MainClient;

	beforeEach(() => {
		jest.clearAllMocks();
		(useContext as jest.Mock).mockReturnValue(mockMainClient);
	});

	it("should provide access to mainApi", () => {
		const { result } = renderHook(() => useMainClient());

		expect(result.current.mainApi).toBeDefined();
	});

	it("should provide access to getProfile method", () => {
		const { result } = renderHook(() => useMainClient());

		expect(result.current.getProfile).toBeDefined();
	});

	it("should provide access to existProfile method", () => {
		const { result } = renderHook(() => useMainClient());
        
		expect(result.current.existProfile).toBeDefined();
		expect(typeof result.current.existProfile).toBe("function");
	});

	it("should provide access to lifeTimeExpire method", () => {
		const { result } = renderHook(() => useMainClient());
        
		expect(result.current.lifeTimeExpire).toBeDefined();
		expect(typeof result.current.lifeTimeExpire).toBe("function");
	});

	it("should provide access to removeProfile method", () => {
		const { result } = renderHook(() => useMainClient());

		expect(result.current.removeProfile).toBeDefined();
	});

	it("should provide access to downloadLogFile method", () => {
		const { result } = renderHook(() => useMainClient());
        
		expect(result.current.downloadLogFile).toBeDefined();
		expect(typeof result.current.downloadLogFile).toBe("function");
	});
});
