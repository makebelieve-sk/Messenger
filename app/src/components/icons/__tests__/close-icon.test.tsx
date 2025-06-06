import { fireEvent, render, screen } from "@testing-library/react";

import CloseIconComponent from "@components/icons/close";

describe("CloseIcon", () => {
	it("renders with default props", () => {
		render(<CloseIconComponent />);
		const icon = screen.getByTestId("close-icon");
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveAttribute("width", "24px");
		expect(icon).toHaveAttribute("height", "24px");
	});

	it("renders with custom size as number", () => {
		render(<CloseIconComponent size={32} />);
		const icon = screen.getByTestId("close-icon");
		expect(icon).toHaveAttribute("width", "32px");
		expect(icon).toHaveAttribute("height", "32px");
	});

	it("renders with custom size as string", () => {
		render(<CloseIconComponent size="48px" />);
		const icon = screen.getByTestId("close-icon");
		expect(icon).toHaveAttribute("width", "48px");
		expect(icon).toHaveAttribute("height", "48px");
	});

	it("renders with custom className", () => {
		render(<CloseIconComponent className="custom-class" />);
		const icon = screen.getByTestId("close-icon");
		expect(icon).toHaveClass("custom-class");
	});

	it("calls onClick handler when clicked", () => {
		const handleClick = jest.fn();
		render(<CloseIconComponent onClick={handleClick} />);
		const icon = screen.getByTestId("close-icon");
		fireEvent.click(icon);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("matches snapshot with default props", () => {
		const { container } = render(<CloseIconComponent />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom size as number", () => {
		const { container } = render(<CloseIconComponent size={32} />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom size as string", () => {
		const { container } = render(<CloseIconComponent size="48px" />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom className", () => {
		const { container } = render(<CloseIconComponent className="custom-class" />);
		expect(container).toMatchSnapshot();
	});
}); 