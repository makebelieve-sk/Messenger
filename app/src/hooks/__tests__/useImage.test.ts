import { renderHook } from "@testing-library/react";

import { API_URL, NO_PHOTO } from "@utils/constants";
import useImage from "../useImage";

describe("useImage", () => {
	it("should return NO_PHOTO when source is null", () => {
		const { result } = renderHook(() => useImage(null));
        
		expect(result.current).toBe(NO_PHOTO);
	});

	it("should return NO_PHOTO when source is empty string", () => {
		const { result } = renderHook(() => useImage(""));
        
		expect(result.current).toBe(NO_PHOTO);
	});
});
