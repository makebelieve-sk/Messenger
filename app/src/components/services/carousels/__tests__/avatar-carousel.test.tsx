import { render, screen, waitFor } from "@testing-library/react";

import AvatarCarousel from "@components/services/carousels/avatar-carousel";
import { mockUserService } from "../../../../__mocks__/@hooks/useProfile";

describe("AvatarCarousel", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUserService.avatarUrl = "";
		mockUserService.id = "";
		mockUserService.fullName = "";
		mockUserService.avatarCreateDate = "";
	});

	it("should match snapshot when user has no avatar", () => {
		const { container } = render(<AvatarCarousel />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot when user has avatar", async () => {
		mockUserService.avatarUrl = "/avatar.jpg";
		mockUserService.id = "123";
		mockUserService.fullName = "John Doe";
		mockUserService.avatarCreateDate = "2024-01-01";

		const { container } = render(<AvatarCarousel />);
		await screen.findByTestId("carousel");
		expect(container).toMatchSnapshot();
	});

	it("should render default image when user has no avatar", async () => {
		render(<AvatarCarousel />);

		const carousel = await screen.findByTestId("carousel");
		expect(carousel).toBeTruthy();

		const image = screen.getByTestId("image");
		expect(image.getAttribute("src")).toBe("/assets/images/noPhoto.jpg");
		expect(image.getAttribute("alt")).toBe("");
	});

	it("should render carousel when user has avatar", async () => {
		mockUserService.avatarUrl = "/avatar.jpg";
		mockUserService.id = "123";
		mockUserService.fullName = "John Doe";
		mockUserService.avatarCreateDate = "2024-01-01";

		render(<AvatarCarousel />);

		const carousel = await screen.findByTestId("carousel");
		expect(carousel).toBeTruthy();

		const image = screen.getByTestId("image");
		expect(image.getAttribute("src")).toBe("/avatar.jpg");
		expect(image.getAttribute("alt")).toBe("123");
	});

	it("should update carousel when user data changes", async () => {
		mockUserService.avatarUrl = "/avatar1.jpg";
		mockUserService.id = "123";
		mockUserService.fullName = "John Doe";
		mockUserService.avatarCreateDate = "2024-01-01";

		const { rerender } = render(<AvatarCarousel />);

		await screen.findByTestId("carousel");

		mockUserService.avatarUrl = "/avatar1.jpg";
		mockUserService.avatarCreateDate = "2024-01-02";

		rerender(<AvatarCarousel />);

		await waitFor(() => {
			const image = screen.getByTestId("image");
			expect(image.getAttribute("src")).toBe("/avatar1.jpg");
		});
	});
});
