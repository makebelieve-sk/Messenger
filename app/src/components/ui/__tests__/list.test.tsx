import { render, screen } from "@testing-library/react";

import ListComponent from "@components/ui/list";

describe("ListComponent", () => {
	const mockProps = {
		children: <div>Test Child</div>,
		className: "custom-class",
	};

	it("should render with children", () => {
		render(<ListComponent {...mockProps} />);
		const list = screen.getByRole("list");
		expect(list).toBeInTheDocument();
		expect(list).toHaveTextContent("Test Child");
	});

	it("should apply custom className", () => {
		render(<ListComponent {...mockProps} />);
		const list = screen.getByRole("list");
		expect(list).toHaveClass("custom-class");
	});

	it("should render without custom className", () => {
		render(<ListComponent children={mockProps.children} />);
		const list = screen.getByRole("list");
		expect(list).not.toHaveClass("custom-class");
	});

	it("should render with empty className", () => {
		render(<ListComponent {...mockProps} className="" />);
		const list = screen.getByRole("list");
		expect(list).not.toHaveClass("custom-class");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<ListComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
