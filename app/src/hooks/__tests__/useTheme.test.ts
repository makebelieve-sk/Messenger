import { act, renderHook } from "@testing-library/react";

import { ThemeTypes } from "@custom-types/enums";
import useTheme from "../useTheme";

describe("useTheme", () => {
	it("should initialize with light theme by default", () => {
		const { result } = renderHook(() => useTheme());
        
		expect(result.current.THEME.palette.mode).toBe(ThemeTypes.LIGHT);
	});

	it("should switch to dark theme when setIsDarkMode is called with true", () => {
		const { result } = renderHook(() => useTheme());
        
		act(() => {
			result.current.setIsDarkMode(true);
		});
        
		expect(result.current.THEME.palette.mode).toBe(ThemeTypes.DARK);
	});

	it("should switch back to light theme when setIsDarkMode is called with false", () => {
		const { result } = renderHook(() => useTheme());
        
		act(() => {
			result.current.setIsDarkMode(true);
		});
        
		act(() => {
			result.current.setIsDarkMode(false);
		});
        
		expect(result.current.THEME.palette.mode).toBe(ThemeTypes.LIGHT);
	});

	it("should return a valid Material-UI theme object", () => {
		const { result } = renderHook(() => useTheme());
        
		expect(result.current.THEME).toBeInstanceOf(Object);
		expect(result.current.THEME.palette).toBeDefined();
		expect(result.current.THEME.palette.mode).toBeDefined();
	});

	it("should maintain theme state between renders", () => {
		const { result, rerender } = renderHook(() => useTheme());
        
		act(() => {
			result.current.setIsDarkMode(true);
		});
        
		rerender();
        
		expect(result.current.THEME.palette.mode).toBe(ThemeTypes.DARK);
	});
});
