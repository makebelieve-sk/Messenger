import { Pages } from "@custom-types/enums";
import { type IUser } from "@custom-types/models.types";
import { getFullName, goToAnotherProfile, muchSelected, setFocusOnEndNodeElement } from "@utils/index";

jest.resetModules();

jest.mock("@service/Logger", () => ({
	init: jest.fn(() => ({ debug: jest.fn() })),
}));

describe("Utils Helpers", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
		const selection = window.getSelection();
		if (selection) selection.removeAllRanges();
	});

	describe("muchSelected", () => {
		const txt = [ "item", "items", "items" ];

		test.each([
			[ 1, "item" ],
			[ 2, "items" ],
			[ 5, "items" ],
			[ 21, "item" ],
			[ 11, "items" ],
			[ 0, "items" ],
			[ 101, "item" ],
			[ 111, "items" ],
		])("%i returns %s", (number, expected) => {
			expect(muchSelected(number, txt)).toBe(expected);
		});
	});

	describe("getFullName", () => {
		test("returns full name for valid user", () => {
			const user: IUser = {
				id: "1",
				firstName: "John",
				secondName: "",
				thirdName: "Doe",
				email: "john@example.com",
				phone: "1234567890",
				fullName: "John Doe",
				avatarUrl: "",
				avatarCreateDate: "",
			};
			const result = getFullName(user);
			expect(result).toBe("John Doe");
		});

		test("returns empty string for undefined user", () => {
			const result = getFullName({ firstName: "", thirdName: "" } as IUser);
			expect(result).toBe(" ");
		});
	});

	describe("setFocusOnEndNodeElement", () => {
		test("places cursor at end of child nodes", () => {
			const container = document.createElement("div");
			const text1 = document.createTextNode("Hello");
			const text2 = document.createTextNode("World");
			container.appendChild(text1);
			container.appendChild(text2);
			document.body.appendChild(container);

			setFocusOnEndNodeElement(container);

			const selection = window.getSelection();
			expect(selection?.rangeCount).toBe(1);
			const range = selection?.getRangeAt(0);
			expect(range?.startContainer).toBe(container);
			expect(range?.startOffset).toBe(2);
		});

		test("uses custom position", () => {
			const container = document.createElement("div");
			const text = document.createTextNode("Text");
			container.appendChild(text);
			document.body.appendChild(container);

			setFocusOnEndNodeElement(container, 1);

			const selection = window.getSelection();
			expect(selection?.rangeCount).toBe(1);
			const range = selection?.getRangeAt(0);
			expect(range?.startContainer).toBe(container);
			expect(range?.startOffset).toBe(1);
		});
	});

	describe("goToAnotherProfile", () => {
		test("returns url without userId", () => {
			const result = goToAnotherProfile(Pages.profile);
			expect(result).toBe(Pages.profile);
		});

		test("returns url with encoded userId", () => {
			const userId = "user/123";
			const result = goToAnotherProfile(Pages.profile, userId);
			expect(result).toBe(`${Pages.profile}/${encodeURIComponent(userId)}`);
		});
	});
});
