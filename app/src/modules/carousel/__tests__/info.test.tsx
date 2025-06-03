import { render, screen } from "@testing-library/react";

import Info from "@modules/carousel/info";
import { type IUser } from "@custom-types/models.types";
import mockUserStore from "../../../__mocks__/@store/user";

jest.mock("@service/i18n", () => ({
	t: (key: string) => {
		const translations: Record<string, string> = {
			"images-carousel-module.you": "You",
			"utils.months.march": "march",
		};
		return translations[key] || key;
	},
}));

describe("Info", () => {
	const mockActiveImage = {
		src: "test-image.jpg",
		alt: "Test Image",
		authorName: "John Doe",
		dateTime: "2024-03-20T10:00:00Z",
		authorAvatarUrl: "avatar.jpg",
	};

	beforeEach(() => {
		mockUserStore.getState().user = {
			id: "123",
			fullName: "John Doe",
		} as IUser;
	});

	it("renders user avatar with correct props", () => {
		render(<Info activeImage={mockActiveImage} />);
		const avatar = screen.getByRole("img", { name: "Test Image" });
    
		expect(avatar).toBeInTheDocument();
		expect(avatar).toHaveAttribute("src", "avatar.jpg");
		expect(avatar).toHaveAttribute("alt", "Test Image");
	});

	it("displays author name when user is not the author", () => {
		mockUserStore.getState().user = {
			id: "456",
			fullName: "Different User",
		} as IUser;

		render(<Info activeImage={mockActiveImage} />);
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});

	it("displays 'You' when user is the author", () => {
		render(<Info activeImage={mockActiveImage} />);
		expect(screen.getByText("You")).toBeInTheDocument();
	});

	it("displays formatted date", () => {
		render(<Info activeImage={mockActiveImage} />);
		expect(screen.getByText("20 march 2024")).toBeInTheDocument();
	});

	it("updates name when authorName changes", () => {
		const { rerender } = render(<Info activeImage={mockActiveImage} />);
		expect(screen.getByText("You")).toBeInTheDocument();

		const newImage = { ...mockActiveImage, authorName: "Jane Doe" };
		rerender(<Info activeImage={newImage} />);
		expect(screen.getByText("Jane Doe")).toBeInTheDocument();
	});

	it("updates date when dateTime changes", () => {
		const { rerender } = render(<Info activeImage={mockActiveImage} />);
		expect(screen.getByText("20 march 2024")).toBeInTheDocument();

		const newImage = { ...mockActiveImage, dateTime: "2024-03-21T10:00:00Z" };
		rerender(<Info activeImage={newImage} />);
		expect(screen.getByText("21 march 2024")).toBeInTheDocument();
	});
});

describe("Info Component Snapshot Tests", () => {
	const mockActiveImage = {
		src: "test-image.jpg",
		alt: "Test Image",
		authorName: "John Doe",
		dateTime: "2024-03-20T10:00:00Z",
		authorAvatarUrl: "avatar.jpg",
	};

	beforeEach(() => {
		mockUserStore.getState().user = {
			id: "123",
			fullName: "John Doe",
		} as IUser;
	});

	it("should match snapshot when user is the author", () => {
		const { container } = render(<Info activeImage={mockActiveImage} />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot when user is not the author", () => {
		mockUserStore.getState().user = {
			id: "456",
			fullName: "Different User",
		} as IUser;

		const { container } = render(<Info activeImage={mockActiveImage} />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot with different author name", () => {
		const newImage = { ...mockActiveImage, authorName: "Jane Doe" };
		const { container } = render(<Info activeImage={newImage} />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot with different date", () => {
		const newImage = { ...mockActiveImage, dateTime: "2024-03-21T10:00:00Z" };
		const { container } = render(<Info activeImage={newImage} />);
		expect(container).toMatchSnapshot();
	});
});
