import { fireEvent, render, screen } from "@testing-library/react";

import LockIconComponent from "@components/icons/lock";

describe("LockIcon", () => {
	it("renders with default props", () => {
		render(<LockIconComponent />);
		const icon = screen.getByTestId("lock-icon");
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveAttribute("width", "24px");
		expect(icon).toHaveAttribute("height", "24px");
	});

	it("renders with custom size as number", () => {
		render(<LockIconComponent size={32} />);
		const icon = screen.getByTestId("lock-icon");
		expect(icon).toHaveAttribute("width", "32px");
		expect(icon).toHaveAttribute("height", "32px");
	});

	it("renders with custom size as string", () => {
		render(<LockIconComponent size="48px" />);
		const icon = screen.getByTestId("lock-icon");
		expect(icon).toHaveAttribute("width", "48px");
		expect(icon).toHaveAttribute("height", "48px");
	});

	it("renders with custom className", () => {
		render(<LockIconComponent className="custom-class" />);
		const icon = screen.getByTestId("lock-icon");
		expect(icon).toHaveClass("custom-class");
	});

	it("calls onClick handler when clicked", () => {
		const handleClick = jest.fn();
		render(<LockIconComponent onClick={handleClick} />);
		const icon = screen.getByTestId("lock-icon");
		fireEvent.click(icon);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("matches snapshot with default props", () => {
		const { container } = render(<LockIconComponent />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom size as number", () => {
		const { container } = render(<LockIconComponent size={32} />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom size as string", () => {
		const { container } = render(<LockIconComponent size="48px" />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom className", () => {
		const { container } = render(<LockIconComponent className="custom-class" />);
		expect(container).toMatchSnapshot();
	});
}); 