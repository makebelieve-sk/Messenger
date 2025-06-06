import * as timeUtils from "@utils/time";

jest.mock("@service/Logger", () => ({
	init: jest.fn().mockReturnValue({
		debug: jest.fn(),
	}),
}));

describe("time utils", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("currentDate is valid UTC string", () => {
		const date = new Date(timeUtils.currentDate);
		expect(date.toUTCString()).toBe(timeUtils.currentDate);
	});

	test("getHoursOrMinutes pads numbers less than 10", () => {
		expect(timeUtils.getHoursOrMinutes(0)).toBe("00");
		expect(timeUtils.getHoursOrMinutes(5)).toBe("05");
		expect(timeUtils.getHoursOrMinutes(9)).toBe("09");
		expect(timeUtils.getHoursOrMinutes(10)).toBe(10);
		expect(timeUtils.getHoursOrMinutes(23)).toBe(23);
	});

	test("getHoursWithMinutes returns correct format", () => {
		const date = new Date("2025-06-02T04:07:00Z").toISOString();
		const result = timeUtils.getHoursWithMinutes(date);
		const hours = new Date(date).getHours().toString().padStart(2, "0");
		const minutes = new Date(date).getMinutes().toString().padStart(2, "0");

		expect(result).toBe(`${hours}:${minutes}`);
	});
});
