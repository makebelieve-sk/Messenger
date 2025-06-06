import { render, screen } from "@testing-library/react";

import ListItemAvatarComponent from "@components/ui/list-item-avatar";

describe("ListItemAvatarComponent", () => {
	const mockProps = {
		children: <div>Test Avatar</div>,
		className: "custom-class",
	};

	it("should render with children", () => {
		render(<ListItemAvatarComponent {...mockProps} />);
		const avatar = screen.getByText("Test Avatar");
		expect(avatar).toBeInTheDocument();
	});

	it("should apply custom className", () => {
		render(<ListItemAvatarComponent {...mockProps} />);
		const avatar = screen.getByText("Test Avatar").parentElement;
		expect(avatar).toHaveClass("custom-class");
	});

	it("should render without custom className", () => {
		render(<ListItemAvatarComponent children={mockProps.children} />);
		const avatar = screen.getByText("Test Avatar").parentElement;
		expect(avatar).not.toHaveClass("custom-class");
	});

	it("should render with empty className", () => {
		render(<ListItemAvatarComponent {...mockProps} className="" />);
		const avatar = screen.getByText("Test Avatar").parentElement;
		expect(avatar).not.toHaveClass("custom-class");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<ListItemAvatarComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
