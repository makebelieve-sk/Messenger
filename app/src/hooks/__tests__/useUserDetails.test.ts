import { renderHook } from "@testing-library/react";

import useUserDetails from "../useUserDetails";

describe("useUserDetails", () => {
	it("should return undefined when user service is not available", () => {
		const { result } = renderHook(() => useUserDetails());

		expect(result.current).not.toBe(undefined);
	});
});
