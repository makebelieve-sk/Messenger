import * as fs from "fs";
import { join } from "path";
import FileLogger from "src/services/logger.service";

// Mock fs module to allow spying on its methods
jest.mock("fs", () => {
	const originalFs = jest.requireActual("fs");
	return {
		...originalFs,
		mkdirSync: jest.fn(),
		readdirSync: jest.fn(),
		statSync: jest.fn(),
		readFileSync: jest.fn(),
		unlinkSync: jest.fn(),
		createWriteStream: jest.fn(),
	};
});

describe("FileLogger", () => {
	const LOG_DIR = join(__dirname, "../../", "logs");
	let mkdirMock: jest.Mock;
	let readdirMock: jest.Mock;
	let statMock: jest.Mock;
	let readFileMock: jest.Mock;
	let unlinkMock: jest.Mock;
	let createWriteStreamMock: jest.Mock;

	type MockWriteStream = {
		write: jest.Mock<
			boolean,
			[
				chunk: Buffer | string,
				encoding?: BufferEncoding,
				callback?: (error: Error) => void,
			]
		>;
		end: jest.Mock;
	};

	const mockStream: MockWriteStream = {
		write: jest.fn().mockReturnValue(true),
		end: jest.fn(),
	};

	const getStaticProperty = <T>(property: string): T =>
		(FileLogger as unknown as Record<string, T>)[property];

	const setStaticProperty = <T>(property: string, value: T) =>
		((FileLogger as unknown as Record<string, T>)[property] = value);

	beforeEach(() => {
		// Reset static state
		setStaticProperty("initialized", false);
		setStaticProperty("lineCount", 0);

		// Retrieve mocks
		mkdirMock = fs.mkdirSync as jest.Mock;
		readdirMock = fs.readdirSync as jest.Mock;
		statMock = fs.statSync as jest.Mock;
		readFileMock = fs.readFileSync as jest.Mock;
		unlinkMock = fs.unlinkSync as jest.Mock;
		createWriteStreamMock = fs.createWriteStream as jest.Mock;

		// Default implementations
		mkdirMock.mockImplementation(() => LOG_DIR);
		readdirMock.mockReturnValue([]);
		statMock.mockReturnValue({ birthtimeMs: Date.now() } as fs.Stats);
		readFileMock.mockReturnValue("");
		unlinkMock.mockImplementation(() => {});
		createWriteStreamMock.mockReturnValue(
			mockStream as unknown as fs.WriteStream,
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it("should initialize directory and stream on first instantiation", () => {
		new FileLogger("TestContext");
		expect(mkdirMock).toHaveBeenCalledWith(LOG_DIR, { recursive: true });
		expect(createWriteStreamMock).toHaveBeenCalled();
		expect(getStaticProperty<number>("lineCount")).toBe(0);
		expect(getStaticProperty<boolean>("initialized")).toBe(true);
	});

	it("should write log messages to stream with correct format", () => {
		const logger = new FileLogger("Ctx");
		logger.log("hello");
		const writeArg = mockStream.write.mock.calls[0][0] as string;
		expect(writeArg).toMatch(/LOG \[Ctx\] hello\n$/);
	});

	it("should trigger rotation when lineCount exceeds MAX_LINES", () => {
		readdirMock.mockReturnValue(["old.log"]);
		statMock.mockReturnValue({ birthtimeMs: Date.now() } as fs.Stats);
		readFileMock.mockReturnValue(Array(5000).fill("x").join("\n"));

		const logger = new FileLogger("Ctx");
		mockStream.write.mockClear();
		mockStream.end.mockClear();
		setStaticProperty("lineCount", 5000);

		logger.log("first");

		expect(mockStream.end).toHaveBeenCalled();
		expect(createWriteStreamMock).toHaveBeenCalledTimes(2);
	});

	it("should clean up old files beyond MAX_FILES", () => {
		const files = Array.from({ length: 6 }, (_, i) => ({
			name: `file${i}.log`,
			time: i,
		}));
		readdirMock.mockReturnValue(files.map((f) => f.name));
		statMock.mockImplementation(
			(path) =>
				({ birthtimeMs: Number(path.match(/file(\d)\.log/)![1]) }) as fs.Stats,
		);
		readFileMock.mockReturnValue(Array(5000).fill("x").join("\n"));
		setStaticProperty("lineCount", 5000);

		new FileLogger("Ctx");

		expect(unlinkMock).toHaveBeenCalledTimes(2);
		expect(unlinkMock).toHaveBeenNthCalledWith(1, join(LOG_DIR, "file0.log"));
		expect(unlinkMock).toHaveBeenNthCalledWith(2, join(LOG_DIR, "file1.log"));
	});

	it("should close the stream and reset initialized on close()", () => {
		const logger = new FileLogger("Ctx");
		logger.close();
		expect(mockStream.end).toHaveBeenCalled();
		expect(getStaticProperty<boolean>("initialized")).toBe(false);
	});
});
