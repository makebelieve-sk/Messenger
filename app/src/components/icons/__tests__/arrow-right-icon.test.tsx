import { fireEvent, render, screen } from "@testing-library/react";

import ArrowRightIconComponent from "@components/icons/arrow-right";

describe("ArrowRightIcon", () => {
	it("renders with default props", () => {
		render(<ArrowRightIconComponent />);
		const icon = screen.getByTestId("arrow-right-icon");
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveAttribute("width", "24px");
		expect(icon).toHaveAttribute("height", "24px");
	});

	it("renders with custom size as number", () => {
		render(<ArrowRightIconComponent size={32} />);
		const icon = screen.getByTestId("arrow-right-icon");
		expect(icon).toHaveAttribute("width", "32px");
		expect(icon).toHaveAttribute("height", "32px");
	});

	it("renders with custom size as string", () => {
		render(<ArrowRightIconComponent size="48px" />);
		const icon = screen.getByTestId("arrow-right-icon");
		expect(icon).toHaveAttribute("width", "48px");
		expect(icon).toHaveAttribute("height", "48px");
	});

	it("renders with custom className", () => {
		render(<ArrowRightIconComponent className="custom-class" />);
		const icon = screen.getByTestId("arrow-right-icon");
		expect(icon).toHaveClass("custom-class");
	});

	it("calls onClick handler when clicked", () => {
		const handleClick = jest.fn();
		render(<ArrowRightIconComponent onClick={handleClick} />);
		const icon = screen.getByTestId("arrow-right-icon");
		fireEvent.click(icon);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("matches snapshot with default props", () => {
		const { container } = render(<ArrowRightIconComponent />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom size as number", () => {
		const { container } = render(<ArrowRightIconComponent size={32} />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom size as string", () => {
		const { container } = render(<ArrowRightIconComponent size="48px" />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom className", () => {
		const { container } = render(<ArrowRightIconComponent className="custom-class" />);
		expect(container).toMatchSnapshot();
	});
}); 