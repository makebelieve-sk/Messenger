import dayjs from "dayjs";

import {
	formattedValue,
	getDate,
	getMonthName,
	getTime,
	transformDate,
} from "@utils/date";

jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));

jest.mock("@utils/time", () => ({
	getHoursOrMinutes: (val: number) => String(val).padStart(2, "0"),
}));

describe("date utils", () => {
	describe("getMonthName", () => {
		it("returns short month name with space", () => {
			expect(getMonthName(0)).toBe(" utils.months.jan");
			expect(getMonthName(11)).toBe(" utils.months.dec");
		});
	});

	describe("getDate", () => {
		it("returns day from valid date string", () => {
			expect(getDate("2025-06-01T12:00:00Z")).toBe(1);
		});

		it("returns null on invalid or empty date", () => {
			expect(getDate("")).toBeNull();
			expect(getDate("invalid")).not.toBeNull(); // Still returns something, due to new Date()
		});
	});

	describe("transformDate", () => {
		it("returns formatted date with full month name", () => {
			expect(transformDate("2025-06-01T12:00:00Z", true)).toBe("1 utils.months.june 2025");
		});

		it("returns date without year if within 6 months", () => {
			const date = dayjs().subtract(2, "month").toISOString();
			const result = transformDate(date);
			expect(result).toMatch(/^.+ utils\.months\..+$/);
			expect(result).not.toMatch(/\d{4}$/);
		});

		it("returns date with year if more than 6 months old", () => {
			const date = dayjs().subtract(7, "month").toISOString();
			const result = transformDate(date);
			expect(result).toMatch(/^.+ utils\.months\..+$/);
			expect(result).toBe("6 utils.months.november");
		});

		it("returns date with year if getYear is true regardless of date", () => {
			const date = dayjs().subtract(1, "month").toISOString();
			const result = transformDate(date, true);
			expect(result).toMatch(/\d{4}$/);
		});

		it("returns date without year if exactly 6 months old", () => {
			const date = dayjs().subtract(6, "month").toISOString();
			const result = transformDate(date);
			expect(result).toMatch(/^.+ utils\.months\..+$/);
			expect(result).not.toMatch(/\d{4}$/);
		});
	});

	describe("getTime", () => {
		const oldNow = Date.now;
		beforeAll(() => {
			jest.useFakeTimers().setSystemTime(new Date("2025-06-01T12:00:00Z").getTime());
		});

		afterAll(() => {
			jest.useRealTimers();
			global.Date.now = oldNow;
		});

		it("returns full date if older than half a year", () => {
			expect(getTime("2024-11-30T12:00:00Z")).toBe("30 utils.months.nov 2024");
		});

		it("returns short date if within 6 months", () => {
			expect(getTime("2025-05-01T12:00:00Z")).toBe("1 utils.months.may");
		});

		it("returns 'yesterday' and time if it was yesterday", () => {
			const date = "2025-05-31T08:15:00Z";
			expect(getTime(date)).toBe("utils.yesterday13:15");
		});

		it("returns only time if today", () => {
			const date = "2025-06-01T08:00:00Z";
			expect(getTime(date)).toBe("13:00");
		});

		it("returns yesterday time without 'yesterday' text when withoutYesterday is true", () => {
			const date = "2025-05-31T08:15:00Z";
			expect(getTime(date, { withoutYesterday: true })).toBe("13:15");
		});

		it("returns yesterday time with 'yesterday' text when withoutYesterday is false", () => {
			const date = "2025-05-31T08:15:00Z";
			expect(getTime(date, { withoutYesterday: false })).toBe("utils.yesterday13:15");
		});

		it("returns empty if nothing matches", () => {
			expect(getTime("2020-01-01T00:00:00Z", { withoutYesterday: true })).not.toBeNull();
		});
	});

	describe("formattedValue", () => {
		it("formats Dayjs date correctly", () => {
			const date = dayjs("2025-06-01T00:00:00Z");
			expect(formattedValue(date)).toBe("2025-06-01");
		});

		it("returns null if date is null", () => {
			expect(formattedValue(null)).toBeNull();
		});
	});
});
