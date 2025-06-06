import { currentSize, isImage } from "@utils/files";

jest.resetModules();

jest.mock("@service/i18n", () => ({
	t: jest.fn(key => `translated:${key}`),
}));

jest.mock("@service/Logger", () => ({
	init: jest.fn(() => ({ debug: jest.fn() })),
}));

describe("fileUtils", () => {
	describe("currentSize", () => {
		test("returns bytes with translation when size < 1024", () => {
			const result = currentSize(500);
			expect(result).toBe("500 translated:utils.byte");
		});

		test("returns kilobytes with one decimal place", () => {
			const result = currentSize(2048);
			expect(result).toBe("2.0 KB");
		});

		test("returns megabytes with one decimal place", () => {
			const size = 5 * 1024 * 1024;
			const result = currentSize(size);
			expect(result).toBe("5.0 MB");
		});

		test("returns gigabytes with one decimal place", () => {
			const size = 3 * 1024 * 1024 * 1024;
			const result = currentSize(size);
			expect(result).toBe("3.0 GB");
		});

		test("caps exponent at GB even for larger sizes", () => {
			const size = 10 * 1024 * 1024 * 1024 * 1024;
			const result = currentSize(size);
			expect(result).toBe(`${(size / 1024 ** 3).toFixed(1)} GB`);
		});
	});

	describe("isImage", () => {
		test("returns true for .png extension", () => {
			expect(isImage("photo.png")).toBe(true);
		});

		test("returns true for .jpeg extension", () => {
			expect(isImage("image.jpeg")).toBe(true);
		});

		test("returns true for .jpg extension", () => {
			expect(isImage("pic.jpg")).toBe(true);
		});

		test("returns false for non-image extensions", () => {
			expect(isImage("document.pdf")).toBe(false);
		});

		test("returns false if no extension present", () => {
			expect(isImage("file")).toBe(false);
		});

		test("returns false for uppercase extension", () => {
			expect(isImage("PHOTO.PNG")).toBe(false);
		});
	});
});
