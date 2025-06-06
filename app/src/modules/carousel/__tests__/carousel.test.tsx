import { render, screen } from "@testing-library/react";

import Carousel, { type ICarouselImage } from "@modules/carousel";

describe("Carousel Component", () => {
	const mockImage: ICarouselImage = {
		src: "test-image.jpg",
		alt: "Test Image",
		authorName: "John Doe",
		dateTime: "2024-03-20",
		authorAvatarUrl: "avatar.jpg",
	};

	it("renders carousel with single image", () => {
		render(<Carousel image={mockImage} activeKey={0} allCount={1} />);
        
		expect(screen.getByTestId("carousel")).toBeInTheDocument();
		expect(screen.getByAltText("Test Image")).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("renders carousel with multiple images and navigation", () => {
		render(<Carousel image={mockImage} activeKey={0} allCount={3} />);
        
		expect(screen.getByTestId("carousel")).toBeInTheDocument();
		expect(screen.getByAltText("Test Image")).toBeInTheDocument();
        
		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(2);
        
		expect(buttons[0]).toBeDisabled();
		expect(buttons[1]).not.toBeDisabled();
	});

	it("disables next button on last image", () => {
		render(<Carousel image={mockImage} activeKey={2} allCount={3} />);
        
		const buttons = screen.getAllByRole("button");
		expect(buttons[0]).not.toBeDisabled();
		expect(buttons[1]).toBeDisabled();
	});

	it("enables both buttons on middle image", () => {
		render(<Carousel image={mockImage} activeKey={1} allCount={3} />);
        
		const buttons = screen.getAllByRole("button");
		expect(buttons[0]).not.toBeDisabled();
		expect(buttons[1]).not.toBeDisabled();
	});

	it("displays correct image properties", () => {
		render(<Carousel image={mockImage} activeKey={0} allCount={1} />);
        
		const image = screen.getByAltText("Test Image");
		expect(image).toHaveAttribute("src", "test-image.jpg");
	});
});

describe("Carousel Component Snapshot Tests", () => {
	const mockImage: ICarouselImage = {
		src: "test-image.jpg",
		alt: "Test Image",
		authorName: "John Doe",
		dateTime: "2024-03-20",
		authorAvatarUrl: "avatar.jpg",
	};

	it("should match snapshot with single image", () => {
		const { container } = render(
			<Carousel image={mockImage} activeKey={0} allCount={1} />,
		);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot with multiple images - first image", () => {
		const { container } = render(
			<Carousel image={mockImage} activeKey={0} allCount={3} />,
		);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot with multiple images - middle image", () => {
		const { container } = render(
			<Carousel image={mockImage} activeKey={1} allCount={3} />,
		);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot with multiple images - last image", () => {
		const { container } = render(
			<Carousel image={mockImage} activeKey={2} allCount={3} />,
		);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot with different image properties", () => {
		const newImage = {
			...mockImage,
			src: "new-image.jpg",
			alt: "New Test Image",
		};
		const { container } = render(
			<Carousel image={newImage} activeKey={0} allCount={1} />,
		);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot with large number of images", () => {
		const { container } = render(
			<Carousel image={mockImage} activeKey={5} allCount={10} />,
		);
		expect(container).toMatchSnapshot();
	});
});
