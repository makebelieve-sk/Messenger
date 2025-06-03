import { act } from "react";
import { RefObject } from "react";
import { renderHook } from "@testing-library/react";

import useResize from "../useResize";

describe("useResize", () => {
	const mockGetBoundingClientRect = jest.fn().mockReturnValue({
		width: 100,
		height: 200,
	});

	const mockElement = {
		getBoundingClientRect: mockGetBoundingClientRect,
	} as unknown as HTMLElement;

	const mockRef: RefObject<HTMLElement> = {
		current: mockElement,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return initial size of 0x0 when ref is null", () => {
		const { result } = renderHook(() => useResize({ current: null }));
        
		expect(result.current).toEqual({ width: 0, height: 0 });
	});

	it("should return initial size of 0x0 when ref is undefined", () => {
		const { result } = renderHook(() => useResize(null));
        
		expect(result.current).toEqual({ width: 0, height: 0 });
	});

	it("should return correct size when ref is provided", () => {
		const { result } = renderHook(() => useResize(mockRef));
        
		expect(result.current).toEqual({ width: 100, height: 200 });
		expect(mockGetBoundingClientRect).toHaveBeenCalled();
	});

	it("should update size when window is resized", () => {
		const { result } = renderHook(() => useResize(mockRef));

		// Simulate window resize
		mockGetBoundingClientRect.mockReturnValueOnce({
			width: 150,
			height: 250,
		});

		act(() => {
			window.dispatchEvent(new Event("resize"));
		});

		expect(result.current).toEqual({ width: 150, height: 250 });
		expect(mockGetBoundingClientRect).toHaveBeenCalledTimes(2);
	});

	it("should clean up event listener on unmount", () => {
		const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
        
		const { unmount } = renderHook(() => useResize(mockRef));
        
		unmount();
        
		expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
	});
});
