import { type ValidateHandleReturnType } from "@core/socket/validation";
import toFormatAck from "../to-format-socket-ack";

describe("toFormatAck", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date("2025-06-02T12:00:00Z"));
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test("calls callback with success response", () => {
		const cb = jest.fn();
		const validateData: ValidateHandleReturnType = {
			success: true,
		};

		toFormatAck(validateData, cb);

		expect(cb).toHaveBeenCalledWith({
			success: true,
			timestamp: Date.now(),
		});
	});

	test("calls callback with failure response and message", () => {
		const cb = jest.fn();
		const validateData: ValidateHandleReturnType = {
			success: false,
			message: "Validation failed",
		};

		toFormatAck(validateData, cb);

		expect(cb).toHaveBeenCalledWith({
			success: false,
			message: "Validation failed",
		});
	});

	test("calls extra callback if provided", () => {
		const cb = jest.fn();
		const extraCb = jest.fn();
		const validateData: ValidateHandleReturnType = {
			success: true,
		};

		toFormatAck(validateData, cb, extraCb);

		expect(extraCb).toHaveBeenCalled();
	});

	test("does not throw if extra callback is not provided", () => {
		const cb = jest.fn();
		const validateData: ValidateHandleReturnType = {
			success: false,
			message: "Missing field",
		};

		expect(() => toFormatAck(validateData, cb)).not.toThrow();
	});
});
