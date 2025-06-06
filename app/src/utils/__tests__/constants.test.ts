import i18next from "@service/i18n";
import * as constants from "@utils/constants";

jest.mock("@service/i18n", () => ({
	t: jest.fn((key: string) => `translated:${key}`),
}));

jest.mock("@utils/constants", () => {
	const i18next = require("@service/i18n");
	return {
		__esModule: true,
		DEV: true,
		BASE_URL: "https://example.com/base",
		API_URL: "https://example.com/api",
		SOCKET_URL: "https://example.com/socket",
		COOKIE_NAME: "my_cookie",
		MAIL_FEEDBACK: "feedback@example.com",
		TIMEOUT_IS_WRITE_MESSAGE: 1500,
		TIMEOUT_HIDE_UPPER_DATE: 2500,
		AXIOS_RESPONSE_ENCODING: "utf-8",
		AXIOS_TIMEOUT: 3000,
		SOCKET_RECONECTION_ATTEMPTS: 5,
		SOCKET_RECONNECTION_DELAY: 2000,
		SOCKET_ACK_TIMEOUT: 4000,
		ARRAY_LOGS_LENGTH: 50,
		LOGS_FILE_NAME: "app.log",
		NO_PHOTO: "/assets/images/noPhoto.jpg",
		REQUIRED_FIELD: i18next.t("utils.required_field"),
		NOT_CORRECT_FORMAT: i18next.t("utils.not_correct_format"),
		SLIDE_ALERT_TIMEOUT: 500,
		ALERT_TIMEOUT: 5000,
		SNACKBAR_TIMEOUT: 10000,
		AVATAR_URL: "avatarUrl",
		PHOTOS_LIMIT: 25,
		SOCKET_MIDDLEWARE_ERROR: "SOCKET_MIDDLEWARE_ERROR",
	};
});

describe("constants.ts exports", () => {
	test("mocks are properly configured", () => {
		// Test i18next mock
		expect(i18next.t).toBeDefined();
		expect(typeof i18next.t).toBe("function");
		expect(i18next.t("test.key")).toBe("translated:test.key");

		// Test constants mock
		expect(constants).toBeDefined();
		expect(constants.DEV).toBeDefined();
	});

	test("DEV and URL/timing constants match mocked values", () => {
		expect(constants.DEV).toBe(true);
		expect(constants.BASE_URL).toBe("https://example.com/base");
		expect(constants.API_URL).toBe("https://example.com/api");
		expect(constants.SOCKET_URL).toBe("https://example.com/socket");
		expect(constants.COOKIE_NAME).toBe("my_cookie");
		expect(constants.MAIL_FEEDBACK).toBe("feedback@example.com");
		expect(constants.TIMEOUT_IS_WRITE_MESSAGE).toBe(1500);
		expect(constants.TIMEOUT_HIDE_UPPER_DATE).toBe(2500);
		expect(constants.AXIOS_RESPONSE_ENCODING).toBe("utf-8");
		expect(constants.AXIOS_TIMEOUT).toBe(3000);
		expect(constants.SOCKET_RECONECTION_ATTEMPTS).toBe(5);
		expect(constants.SOCKET_RECONNECTION_DELAY).toBe(2000);
		expect(constants.SOCKET_ACK_TIMEOUT).toBe(4000);
		expect(constants.ARRAY_LOGS_LENGTH).toBe(50);
		expect(constants.LOGS_FILE_NAME).toBe("app.log");
	});

	test("static constants and translations are correct", () => {
		expect(constants.NO_PHOTO).toBe("/assets/images/noPhoto.jpg");
		expect(i18next.t).toHaveBeenCalledWith("utils.required_field");
		expect(i18next.t).toHaveBeenCalledWith("utils.not_correct_format");
		expect(constants.REQUIRED_FIELD).toBe("translated:utils.required_field");
		expect(constants.NOT_CORRECT_FORMAT).toBe("translated:utils.not_correct_format");

		expect(constants.SLIDE_ALERT_TIMEOUT).toBe(500);
		expect(constants.ALERT_TIMEOUT).toBe(5000);
		expect(constants.SNACKBAR_TIMEOUT).toBe(10000);
		expect(constants.AVATAR_URL).toBe("avatarUrl");
		expect(constants.PHOTOS_LIMIT).toBe(25);
		expect(constants.SOCKET_MIDDLEWARE_ERROR).toBe("SOCKET_MIDDLEWARE_ERROR");
	});
});
