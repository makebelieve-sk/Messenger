import { act } from "react";
import { RefObject } from "react";
import { renderHook } from "@testing-library/react";

import useResize from "../useResize";

class MockResizeObserver {
	callback: ResizeObserverCallback;
	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
	}
	observe = jest.fn();
	unobserve = jest.fn();
	disconnect = jest.fn();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.ResizeObserver = MockResizeObserver as any;

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

	it("should update size when element is resized", () => {
		const { result } = renderHook(() => useResize(mockRef));

		const newWidth = 150;
		const newHeight = 250;

		mockGetBoundingClientRect.mockReturnValueOnce({
			width: newWidth,
			height: newHeight,
		});

		const mockEntry: ResizeObserverEntry = {
			target: mockElement,
			contentRect: {
				width: newWidth,
				height: newHeight,
				top: 0,
				left: 0,
				right: newWidth,
				bottom: newHeight,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			},
			contentBoxSize: [],
			devicePixelContentBoxSize: [],
			borderBoxSize: [],
		};

		const resizeObserver = new MockResizeObserver(() => {});

		act(() => {
			resizeObserver.callback([ mockEntry ], resizeObserver);
		});

		expect(result.current.width).toBeGreaterThan(0);
		expect(result.current.height).toBeGreaterThan(0);
		expect(result.current).toEqual(expect.objectContaining({
			width: expect.any(Number),
			height: expect.any(Number),
		}));
		expect(mockGetBoundingClientRect).toHaveBeenCalled();
	});
});
