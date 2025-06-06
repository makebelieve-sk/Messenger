jest.resetModules();

jest.mock("@utils/constants", () => ({
	ARRAY_LOGS_LENGTH: 2,
	DEV: true,
	LOGS_FILE_NAME: "logs.txt",
}));

jest.mock("@custom-types/enums", () => ({
	DebuggerType: {
		DEBUG: "DEBUG",
		INFO: "INFO",
		WARN: "WARN",
		ERROR: "ERROR",
	},
}));

describe("Logger", () => {
	let Logger: typeof import("@service/Logger").default;
	let createObjectURLMock: jest.Mock & { lastBlob: Blob };
	let revokeObjectURLMock: jest.Mock;
	let clickedHref: string;
	let clickedDownload: string;

	beforeEach(async () => {
		jest.resetModules();
		global.navigator = {} as Navigator;

		createObjectURLMock = jest.fn(blob => {
			createObjectURLMock.lastBlob = blob;
			return "blob:mock-url";
		}) as jest.Mock & { lastBlob: Blob };
		revokeObjectURLMock = jest.fn();

		class MockBlob implements Blob {
			private content: string;
			public size: number;
			public type: string;

			constructor(parts: string[], options?: BlobPropertyBag) {
				this.content = parts.join("");
				this.size = this.content.length;
				this.type = options?.type || "";
			}

			async text(): Promise<string> {
				return this.content;
			}

			async arrayBuffer(): Promise<ArrayBuffer> {
				const encoder = new TextEncoder();
				const uint8Array = encoder.encode(this.content);
				return uint8Array.buffer as ArrayBuffer;
			}

			async bytes(): Promise<Uint8Array> {
				const encoder = new TextEncoder();
				return encoder.encode(this.content);
			}

			slice(start?: number, end?: number, contentType?: string): Blob {
				const slicedContent = this.content.slice(start, end);
				return new MockBlob([ slicedContent ], { type: contentType || this.type });
			}

			stream(): ReadableStream<Uint8Array> {
				return new ReadableStream({
					start: (controller) => {
						const encoder = new TextEncoder();
						controller.enqueue(encoder.encode(this.content));
						controller.close();
					},
				});
			}
		}

		global.Blob = MockBlob as unknown as typeof Blob;

		global.URL = {
			createObjectURL: createObjectURLMock,
			revokeObjectURL: revokeObjectURLMock,
			prototype: URL.prototype,
			canParse: URL.canParse,
			parse: URL.parse,
		} as unknown as typeof URL;

		document.body.innerHTML = "<div></div>";
		document.createElement = tagName => {
			if (tagName === "a") {
				return {
					set href(value) {
						clickedHref = value;
					},
					get href() {
						return clickedHref;
					},
					set download(value) {
						clickedDownload = value;
					},
					click: jest.fn(),
				};
			}
			return document.createElement(tagName);
		};

		Logger = (await import("@service/Logger")).default;
	});

	test("debug() appends a log entry without calling console methods", async () => {
		const logger = Logger.init("PREFIX");
		const spyLog = jest.spyOn(console, "log").mockImplementation(() => { });
		const spyWarn = jest.spyOn(console, "warn").mockImplementation(() => { });
		const spyError = jest.spyOn(console, "error").mockImplementation(() => { });

		logger.debug("debug message");

		expect(spyLog).not.toHaveBeenCalled();
		expect(spyWarn).not.toHaveBeenCalled();
		expect(spyError).not.toHaveBeenCalled();
	});

	test("info() calls console.log when DEV is true", async () => {
		const logger = Logger.init("PREFIX");
		const spyLog = jest.spyOn(console, "log").mockImplementation(() => { });

		logger.info("info message");

		expect(spyLog).toHaveBeenCalledWith("info message");
	});

	test("warn() calls console.warn", async () => {
		const logger = Logger.init("PREFIX");
		const spyWarn = jest.spyOn(console, "warn").mockImplementation(() => { });

		logger.warn("warn message");

		expect(spyWarn).toHaveBeenCalledWith("warn message");
	});

	test("error() calls console.error", async () => {
		const logger = Logger.init("PREFIX");
		const spyError = jest.spyOn(console, "error").mockImplementation(() => { });

		logger.error("error message");

		expect(spyError).toHaveBeenCalledWith("error message");
	});

	test("downloadToFile() creates a blob containing all log entries", async () => {
		const logger = Logger.init("PREFIX");

		logger.debug("first");
		logger.info("second");

		await logger.downloadToFile();
		const blob = createObjectURLMock.lastBlob;
		const text = await blob.text();
		const lines = text.split("\n");

		expect(lines.length).toBe(2);
		expect(lines[0]).toMatch(/\[.*\] APP:DEBUG:PREFIX \| first/);
		expect(lines[1]).toMatch(/\[.*\] APP:INFO:PREFIX \| second/);
		expect(clickedDownload).toBe("logs.txt");
	});

	test("arrayLogs resets when exceeding ARRAY_LOGS_LENGTH", async () => {
		const logger = Logger.init("PREFIX");

		logger.info("one");
		logger.info("two");
		logger.info("three");
		logger.info("four");

		await logger.downloadToFile();
		const blob = createObjectURLMock.lastBlob;
		const text = await blob.text();
		const lines = text.split("\n");

		expect(lines.length).toBe(1);
		expect(lines[0]).toMatch(/\[.*\] APP:INFO:PREFIX \| four/);
	});
});
