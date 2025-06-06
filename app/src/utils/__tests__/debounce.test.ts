import debounce from "@utils/debounce";

describe("debounce", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test("should call the function only once after the wait time", () => {
		const fn = jest.fn();
		const debouncedFn = debounce(fn, 1000);

		debouncedFn();
		debouncedFn();
		debouncedFn();

		expect(fn).not.toHaveBeenCalled();

		jest.advanceTimersByTime(1000);

		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("should pass arguments correctly to the debounced function", () => {
		const fn = jest.fn();
		const debouncedFn = debounce(fn, 1000);

		debouncedFn("test", 123);

		jest.advanceTimersByTime(1000);

		expect(fn).toHaveBeenCalledWith("test", 123);
	});

	test("should maintain the correct 'this' context", () => {
		const context = { value: 42 };
		const fn = jest.fn(function(this: typeof context) {
			expect(this.value).toBe(42);
		});

		const debouncedFn = debounce(fn, 1000);
		debouncedFn.call(context);

		jest.advanceTimersByTime(1000);
	});

	test("should reset the timer when called multiple times", () => {
		const fn = jest.fn();
		const debouncedFn = debounce(fn, 1000);

		debouncedFn();
		jest.advanceTimersByTime(500);
		debouncedFn();
		jest.advanceTimersByTime(500);

		expect(fn).not.toHaveBeenCalled();

		jest.advanceTimersByTime(1000);

		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("should handle multiple debounced functions independently", () => {
		const fn1 = jest.fn();
		const fn2 = jest.fn();
		const debouncedFn1 = debounce(fn1, 1000);
		const debouncedFn2 = debounce(fn2, 2000);

		debouncedFn1();
		debouncedFn2();

		jest.advanceTimersByTime(1000);
		expect(fn1).toHaveBeenCalledTimes(1);
		expect(fn2).not.toHaveBeenCalled();

		jest.advanceTimersByTime(1000);
		expect(fn2).toHaveBeenCalledTimes(1);
	});

	test("should handle zero wait time", () => {
		const fn = jest.fn();
		const debouncedFn = debounce(fn, 0);

		debouncedFn();
		debouncedFn();

		jest.advanceTimersByTime(0);

		expect(fn).toHaveBeenCalledTimes(1);
	});
});
