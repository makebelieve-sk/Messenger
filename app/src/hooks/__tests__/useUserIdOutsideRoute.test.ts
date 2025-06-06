import { matchPath, useLocation } from "react-router-dom";
import { renderHook } from "@testing-library/react";

import useUserIdFromPath from "../useUserIdOutsideRoute";

jest.mock("react-router-dom", () => ({
	useLocation: jest.fn(),
	matchPath: jest.fn(),
}));

describe("useUserIdFromPath", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return undefined for invalid route", () => {
		(useLocation as jest.Mock).mockReturnValue({
			pathname: "/invalid/route",
		});
		(matchPath as jest.Mock).mockReturnValue(null);

		const { result } = renderHook(() => useUserIdFromPath());
		expect(result.current).toBeUndefined();
	});

	it("should return userId for valid route", () => {
		const userId: string = "123";
		(useLocation as jest.Mock).mockReturnValue({
			pathname: `/user/${userId}`,
		});
		(matchPath as jest.Mock).mockReturnValue({ params: { userId } });

		const { result } = renderHook(() => useUserIdFromPath());
		expect(result.current).toBe(userId);
	});
});
