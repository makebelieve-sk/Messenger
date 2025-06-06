import { fireEvent, render, screen } from "@testing-library/react";

import PhotoComponent from "@components/ui/photo";
import { NO_PHOTO } from "@utils/constants";

describe("PhotoComponent", () => {
	const mockProps = {
		src: "https://example.com/photo.jpg",
		alt: "Test Photo",
		showDeleteIcon: true,
		isLazy: false,
		clickHandler: jest.fn(),
		deleteHandler: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render with image", () => {
		render(<PhotoComponent {...mockProps} />);
        
		const image = screen.getByTestId("image");
		expect(image).toBeInTheDocument();
		expect(image).toHaveAttribute("src", mockProps.src);
		expect(image).toHaveAttribute("alt", mockProps.alt);
	});

	it("should render with lazy loading", () => {
		render(
			<PhotoComponent 
				{...mockProps} 
				isLazy={true}
			/>,
		);
        
		const image = screen.getByTestId("image");
		expect(image).toHaveAttribute("loading", "lazy");
	});

	it("should render with eager loading by default", () => {
		render(<PhotoComponent {...mockProps} />);
        
		const image = screen.getByTestId("image");
		expect(image).toHaveAttribute("loading", "eager");
	});

	it("should not show delete icon on hover when showDeleteIcon is false", () => {
		render(
			<PhotoComponent 
				{...mockProps} 
				showDeleteIcon={false}
			/>,
		);
        
		const container = screen.getByTestId("image").parentElement;
		fireEvent.mouseEnter(container!);
        
		const closeIcon = screen.queryByTestId("close-icon");
		expect(closeIcon).not.toBeInTheDocument();
	});

	it("should not show delete icon for NO_PHOTO image", () => {
		render(
			<PhotoComponent 
				{...mockProps} 
				src={NO_PHOTO}
			/>,
		);
        
		const container = screen.getByTestId("image").parentElement;
		fireEvent.mouseEnter(container!);
        
		const closeIcon = screen.queryByTestId("close-icon");
		expect(closeIcon).not.toBeInTheDocument();
	});

	it("should call clickHandler when clicked", () => {
		render(<PhotoComponent {...mockProps} />);
        
		const container = screen.getByTestId("image").parentElement;
		fireEvent.click(container!);
        
		expect(mockProps.clickHandler).toHaveBeenCalled();
	});

	it("should hide delete icon when mouse leaves", () => {
		render(<PhotoComponent {...mockProps} />);
        
		const container = screen.getByTestId("image").parentElement;
		fireEvent.mouseEnter(container!);
		fireEvent.mouseLeave(container!);
        
		const closeIcon = screen.queryByTestId("close-icon");
		expect(closeIcon).not.toBeInTheDocument();
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<PhotoComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
