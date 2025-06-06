import { render, screen } from "@testing-library/react";

import ListItemTextComponent from "@components/ui/list-item-text";

describe("ListItemTextComponent", () => {
	const mockProps = {
		primary: "Primary Text",
		secondary: "Secondary Text",
		className: "custom-class",
	};

	it("should render with primary and secondary text", () => {
		render(<ListItemTextComponent {...mockProps} />);
		expect(screen.getByText("Primary Text")).toBeInTheDocument();
		expect(screen.getByText("Secondary Text")).toBeInTheDocument();
	});

	it("should apply custom className", () => {
		render(<ListItemTextComponent {...mockProps} />);
		const textContainer = screen.getByText("Primary Text").parentElement;
		expect(textContainer).toHaveClass("custom-class");
	});

	it("should render without custom className", () => {
		const { primary, secondary } = mockProps;
		render(<ListItemTextComponent primary={primary} secondary={secondary} />);
		const textContainer = screen.getByText("Primary Text").parentElement;
		expect(textContainer).not.toHaveClass("custom-class");
	});

	it("should render with empty className", () => {
		render(<ListItemTextComponent {...mockProps} className="" />);
		const textContainer = screen.getByText("Primary Text").parentElement;
		expect(textContainer).not.toHaveClass("custom-class");
	});

	it("should render with ReactNode as secondary", () => {
		const secondaryNode = <span>Custom Secondary</span>;
		render(<ListItemTextComponent primary={mockProps.primary} secondary={secondaryNode} />);
		expect(screen.getByText("Custom Secondary")).toBeInTheDocument();
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<ListItemTextComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
