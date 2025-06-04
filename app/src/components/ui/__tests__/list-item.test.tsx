import { render, screen } from "@testing-library/react";

import ListItemComponent from "@components/ui/list-item";

describe("ListItemComponent", () => {
	const mockProps = {
		children: <div>Test Child</div>,
		className: "custom-class",
	};

	it("should render with children", () => {
		render(<ListItemComponent {...mockProps} />);
		const listItem = screen.getByRole("listitem");
		expect(listItem).toBeInTheDocument();
		expect(listItem).toHaveTextContent("Test Child");
	});

	it("should apply custom className", () => {
		render(<ListItemComponent {...mockProps} />);
		const listItem = screen.getByRole("listitem");
		expect(listItem).toHaveClass("custom-class");
	});

	it("should render without custom className", () => {
		render(<ListItemComponent children={mockProps.children} />);
		const listItem = screen.getByRole("listitem");
		expect(listItem).not.toHaveClass("custom-class");
	});

	it("should render with empty className", () => {
		render(<ListItemComponent {...mockProps} className="" />);
		const listItem = screen.getByRole("listitem");
		expect(listItem).not.toHaveClass("custom-class");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<ListItemComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
