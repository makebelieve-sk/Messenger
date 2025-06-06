import { renderHook } from "@testing-library/react";

import useProfile from "../useProfile";
import useUser from "../useUser";

jest.mock("../useProfile");

describe("useUser", () => {
	it("should return userService from profile", () => {
		const mockUserService = { id: "123", name: "Test User" };
		(useProfile as jest.Mock).mockReturnValue({ userService: mockUserService });

		const { result } = renderHook(() => useUser());

		expect(result.current).not.toBe(mockUserService);
		expect(useProfile).not.toHaveBeenCalledWith(undefined);
	});
});
